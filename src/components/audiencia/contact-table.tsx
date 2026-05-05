"use client";

import { useState } from "react";
import { Download, Plus, Search, Trash, Upload, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockContacts, type Contact } from "@/lib/mock-data/contacts";
import { ImportModal } from "./import-modal";
import { AddContactModal } from "./add-contact-modal";

export function ContactTable() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.whatsapp.includes(searchTerm)
  );

  const handleAddContact = (data: any) => {
    const newContact: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      whatsapp: data.phone,
      email: data.email,
      subscriptionDate: new Date().toISOString(),
      additionalInfo: data.additionalInfo
    };
    setContacts([...contacts, newContact]);
  };

  const handleRemoveAll = () => {
    if (confirm("Tem certeza que deseja remover todos os contatos?")) {
      setContacts([]);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Remover este contato?")) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <h1 className="text-2xl font-bold">Audiência</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="destructive" size="sm" onClick={handleRemoveAll}>
            <Trash className="mr-2 h-4 w-4" />
            Remover todos
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nome, email ou telefone..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data de Inscrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum contato encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.whatsapp}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{new Date(contact.subscriptionDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(contact.id)}>
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={() => {
          alert("Simulação: Contatos importados com sucesso!");
          setIsImportModalOpen(false);
        }} 
      />
      
      <AddContactModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddContact}
      />
    </div>
  );
}
