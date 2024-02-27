import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useFormContext } from 'react-hook-form';
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import {
  retrieveAIResponse,
  retrieveTextFromSpeech,
} from '@/app/services/chatService';
import {
  appendMessageToConversation,
  augmentUserMessageWithHistory,
} from '@/app/services/longTermMemoryService';
import { queryVectorDbByNamespace } from '@/app/services/vectorDbService';
import { generateEmbeddings } from '@/app/services/embeddingService';
const nlp = winkNLP(model);

export const useMessageProcessing = (session: any) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { watch, setValue } = useFormContext();

  const isTextToSpeechEnabled = watch('isTextToSpeechEnabled');
  const isAssistantEnabled = watch('isAssistantEnabled');
  const isRagEnabled = watch('isRagEnabled');
  const isLongTermMemoryEnabled = watch('isLongTermMemoryEnabled');
  const model = watch('model');
  const voice = watch('voice');
  const topK = watch('topK');
  const memoryType = watch('memoryType');
  const historyLength = watch('historyLength');
  const sentences = useRef<string[]>([]);
  const sentenceIndex = useRef<number>(0);

  const addUserMessageToState = (message: string) => {
    sentences.current = [];
    sentenceIndex.current = 0;
    const userMessageId = uuidv4();

    const newIMessage: IMessage = {
      id: userMessageId,
      conversationId: session?.user?.email,
      sender: 'user',
      text: message,
      createdAt: new Date(),
      metadata: '',
    };
    setMessages((prevMessages) => [...prevMessages, newIMessage]);
    return newIMessage;
  };

  const addAiMessageToState = (
    aiResponseText: string,
    aiResponseId: string
  ) => {
    const newIMessage: IMessage = {
      id: aiResponseId,
      conversationId: session?.user?.email,
      text: aiResponseText,
      sender: 'ai',
      createdAt: new Date(),
    };

    setMessages((prevMessages) => [
      ...prevMessages.filter((msg) => msg.id !== aiResponseId),
      newIMessage,
    ]);
    return newIMessage;
  };

  const processAIResponseStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined,
    aiResponseId: string
  ) => {
    if (!reader) {
      console.error(
        'No reader available for processing the AI response stream.'
      );
      return;
    }
    const decoder = new TextDecoder();
    let buffer = '';
    let aiResponseText = '';
    let newMessage = {} as IMessage;
    const processChunk = async () => {
      const { done, value } = await reader.read();

      if (done) {
        newMessage = (await processBuffer(
          buffer,
          aiResponseId,
          aiResponseText
        )) as IMessage;
        return true;
      }
      buffer += value ? decoder.decode(value, { stream: true }) : '';
      await processBuffer(buffer, aiResponseId, aiResponseText);
      return false;
    };

    let isDone = false;
    while (!isDone) {
      isDone = await processChunk();
    }
    if (isLongTermMemoryEnabled) {
      await storeMessageInMemory(newMessage);
    }
    if (isTextToSpeechEnabled) {
      await retrieveTextFromSpeech(
        sentences.current[sentences.current.length - 1],
        model,
        voice
      );
    }
  };

  const processBuffer = async (
    buffer: string,
    aiResponseId: string,
    aiResponseText: string
  ) => {
    let boundary = buffer.lastIndexOf('\n');
    if (boundary === -1) return;

    let completeData = buffer.substring(0, boundary);
    completeData.split('\n').forEach((line) => {
      if (line) {
        try {
          const json = JSON.parse(line);
          if (json?.choices[0]?.delta?.content) {
            aiResponseText += json.choices[0].delta.content;
          }
        } catch (error) {
          console.error('Failed to parse JSON: ', line, error);
        }
      }
    });

    const doc = nlp.readDoc(aiResponseText);
    sentences.current = doc.sentences().out();
    const newMessage = addAiMessageToState(aiResponseText, aiResponseId);
    if (isTextToSpeechEnabled) {
      if (sentences.current.length > sentenceIndex.current + 1) {
        await retrieveTextFromSpeech(
          sentences.current[sentenceIndex.current++],
          model,
          voice
        );
      }
    }
    return newMessage;
  };

  const sendUserMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setValue('isLoading', true);
      const newMessage = addUserMessageToState(message);

      if (isLongTermMemoryEnabled) {
        await storeMessageInMemory(newMessage);
      }
      const aiResponseId = uuidv4();
      const userEmail = session?.user?.email as string;

      let augmentedMessage = `FOLLOW THESE INSTRUCTIONS AT ALL TIMES:
1. Make use of CONTEXT and HISTORY below, to briefly respond to the user prompt. 
2. If you cannot find this information within the CONTEXT, or HISTORY, respond to the user prompt as best as you can. `;

      if (isRagEnabled) {
        const ragContext = await enhanceUserResponse(message, userEmail);
        augmentedMessage += `

CONTEXT: ${ragContext || ''}`;
      }

      if (isLongTermMemoryEnabled && historyLength > 0) {
        const userEmail = session?.user?.email as string;
        const response = await augmentUserMessageWithHistory({
          message,
          userEmail,
          historyLength,
          memoryType,
        });
        augmentedMessage += `
        
HISTORY: 
${response.formattedConversationHistory || ''}`;
      }
      message = `${augmentedMessage}

PROMPT: 
${message}
      `;
      console.log('Message to be sent to AI: ', message);
      const response = await retrieveAIResponse(
        message,
        userEmail,
        isAssistantEnabled
      );

      if (!response) {
        return;
      }
      if (isAssistantEnabled) {
        await processResponse(response, aiResponseId);
      } else {
        await processStream(response, aiResponseId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setValue('isLoading', false);
    }
  };

  async function storeMessageInMemory(message: IMessage) {
    const appendMessageToConversationResponse =
      await appendMessageToConversation({
        userEmail: session?.user?.email,
        message,
        memoryType,
      });
    console.log(
      'appendMessageToConversationResponse: ',
      appendMessageToConversationResponse
    );
  }

  async function enhanceUserResponse(message: string, userEmail: string) {
    const jsonMessage = [
      {
        text: message,
        metadata: {
          user_email: userEmail,
        },
      },
    ];

    const embeddedMessage = await generateEmbeddings(jsonMessage, userEmail);

    const vectorResponse = await queryVectorDbByNamespace(
      embeddedMessage.embeddings,
      userEmail,
      topK
    );

    const context = vectorResponse.response.matches.map((item: any) => {
      return {
        text: item.metadata.text,
      };
    });
    return JSON.stringify(context);
  }

  async function processResponse(
    response: ReadableStreamDefaultReader<Uint8Array> | Response,
    aiResponseId: string
  ) {
    if (!(response instanceof Response)) {
      console.error('Expected a Response object, received: ', response);
      return;
    }
    try {
      const contentType = response.headers.get('Content-Type');
      const data = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();
      addAiMessageToState(data, aiResponseId);
      if (isTextToSpeechEnabled) {
        await retrieveTextFromSpeech(data, model, voice);
      }
    } catch (error) {
      console.error('Error processing response: ', error);
    }
  }
  async function processStream(
    stream: ReadableStreamDefaultReader<Uint8Array> | Response,
    aiResponseId: string
  ) {
    if (!(stream instanceof ReadableStreamDefaultReader)) {
      console.error(
        'Expected a ReadableStreamDefaultReader object, received: ',
        stream
      );
      return;
    }
    try {
      await processAIResponseStream(stream, aiResponseId);
    } catch (error) {
      console.error('Error processing stream: ', error);
    }
  }

  return {
    messages,
    sendUserMessage,
  };
};
