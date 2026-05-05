"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming Textarea exists or I'll use Input

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contact: any) => void;
}

export function AddContactModal({ isOpen, onClose, onAdd }: AddContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birthDate: "",
    additionalInfo: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    onAdd(formData);
    onClose();
    setFormData({
      name: "",
      phone: "",
      email: "",
      birthDate: "",
      additionalInfo: ""
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Contato"
      description="Preencha as informações abaixo para adicionar um novo contato."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar Contato</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Ex: Maria Silva" 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (WhatsApp)</Label>
            <Input 
              id="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="+55 (11) 99999-9999" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input 
              id="birthDate" 
              type="date"
              value={formData.birthDate} 
              onChange={handleChange} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email"
            value={formData.email} 
            onChange={handleChange} 
            placeholder="maria@exemplo.com" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Informações Adicionais</Label>
          <Input 
            id="additionalInfo" 
            value={formData.additionalInfo} 
            onChange={handleChange} 
            placeholder="Tags, observações, etc." 
          />
        </div>
      </div>
    </Modal>
  );
}
