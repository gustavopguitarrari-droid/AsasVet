"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

const ImportDataSettings: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<string>(""); // e.g., 'clients', 'pets', 'appointments'
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importMessage, setImportMessage] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setImportMessage('');
      setImportStatus('idle');
    } else {
      setSelectedFile(null);
    }
  };

  const handleImportData = async () => {
    if (!selectedFile) {
      showError("Por favor, selecione um arquivo para importar.");
      return;
    }
    if (!dataType) {
      showError("Por favor, selecione o tipo de dado a ser importado.");
      return;
    }

    setImportStatus('loading');
    setImportMessage('Processando importação...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileContent = e.target?.result as string;
      // Em uma implementação real, você faria o parsing do fileContent (ex: CSV, JSON)
      // e então o enviaria para uma API de backend ou uma função utilitária para inserção no banco de dados.
      // Para este exemplo, vamos simular uma importação bem-sucedida.

      console.log(`Simulando importação de ${dataType} do arquivo: ${selectedFile.name}`);
      console.log("Conteúdo do arquivo (primeiros 200 caracteres):", fileContent.substring(0, 200));

      // Simula um atraso de chamada de API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simula sucesso ou erro com base em alguma condição (ex: conteúdo do arquivo)
      if (fileContent.includes("error_trigger")) { // Exemplo: se o arquivo contiver "error_trigger"
        setImportStatus('error');
        setImportMessage(`Erro ao importar ${dataType}. Verifique o formato do arquivo.`);
        showError(`Erro ao importar ${dataType}.`);
      } else {
        setImportStatus('success');
        setImportMessage(`Importação de ${dataType} concluída com sucesso!`);
        showSuccess(`Importação de ${dataType} concluída!`);
      }
    };

    reader.onerror = () => {
      setImportStatus('error');
      setImportMessage("Erro ao ler o arquivo.");
      showError("Erro ao ler o arquivo.");
    };

    reader.readAsText(selectedFile);
  };

  const isImportDisabled = !selectedFile || !dataType || importStatus === 'loading';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UploadCloud className="mr-2 h-5 w-5" /> Importar Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Importe dados de clientes, animais, agendamentos e outros registros de outro sistema para o AsasVet.
          Atualmente, suportamos a importação de arquivos CSV.
        </p>

        <div className="grid gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="data-type">Tipo de Dados a Importar</Label>
            <Select value={dataType} onValueChange={setDataType} disabled={importStatus === 'loading'}>
              <SelectTrigger id="data-type">
                <SelectValue placeholder="Selecione o tipo de dado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clients">Tutores</SelectItem>
                <SelectItem value="pets">Animais</SelectItem>
                <SelectItem value="events">Agendamentos (Agenda)</SelectItem>
                {/* Adicione mais tipos de dados conforme necessário */}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="data-file">Arquivo CSV</Label>
            <Input
              id="data-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={importStatus === 'loading'}
            />
          </div>

          <Button onClick={handleImportData} className="w-full md:w-auto" disabled={isImportDisabled}>
            {importStatus === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importando...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" /> Iniciar Importação
              </>
            )}
          </Button>
        </div>

        {importMessage && (
          <div className={`flex items-center space-x-2 p-3 rounded-md ${
            importStatus === 'success' ? 'bg-green-50 text-green-800' :
            importStatus === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {importStatus === 'success' && <CheckCircle className="h-5 w-5" />}
            {importStatus === 'error' && <XCircle className="h-5 w-5" />}
            {importStatus === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            <p className="text-sm">{importMessage}</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          (Esta é uma funcionalidade de demonstração. A importação real de dados requer um formato CSV específico e validação de dados.
          Entre em contato com o suporte para mais detalhes sobre os formatos de arquivo suportados.)
        </p>
      </CardContent>
    </Card>
  );
};

export default ImportDataSettings;