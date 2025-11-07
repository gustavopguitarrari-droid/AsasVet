"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Sheet, // Alterado de Dialog para Sheet
  SheetContent, // Alterado de DialogContent para SheetContent
  SheetHeader, // Alterado de DialogHeader para SheetHeader
  SheetTitle, // Alterado de DialogTitle para SheetTitle
  SheetDescription, // Alterado de DialogDescription para SheetDescription
  SheetFooter, // Alterado de DialogFooter para SheetFooter
} from "@/components/ui/sheet"; // Importar Sheet
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquareText, Send, X } from 'lucide-react'; // Adicionado X para o botão de fechar
import { ScrollArea } from "@/components/ui/scroll-area"; // Importar ScrollArea

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

const ChatDialog: React.FC<ChatDialogProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage("");

    // Simular uma resposta do agente após um pequeno atraso
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Olá! Como posso ajudar você hoje?",
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prevMessages) => [...prevMessages, agentResponse]);
    }, 1000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full md:w-[450px] flex flex-col rounded-l-xl shadow-lg"> {/* Ajustado para SheetContent, largura e adicionado rounded-l-xl e shadow-lg */}
        <SheetHeader className="pb-4"> {/* Adicionado padding inferior */}
          <SheetTitle className="flex items-center">
            <MessageSquareText className="h-5 w-5 mr-2" /> Atendimento ao Cliente
          </SheetTitle>
          <SheetDescription>
            Converse com nossa equipe de suporte.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4 border rounded-lg bg-muted/20 mb-4 shadow-inner"> {/* Alterado para rounded-lg e shadow-inner */}
          <div className="flex flex-col space-y-2">
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground text-sm">
                Nenhuma mensagem ainda. Digite para começar!
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-xl ${ // Alterado para rounded-xl e p-3
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <span className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/80' : 'text-secondary-foreground/80'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row items-center space-x-2 pt-4"> {/* Adicionado padding superior */}
          <Input
            placeholder="Digite sua mensagem..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="flex-1 rounded-lg" // Adicionado rounded-lg
          />
          <Button type="submit" onClick={handleSendMessage} size="icon" className="rounded-lg"> {/* Adicionado rounded-lg */}
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ChatDialog;