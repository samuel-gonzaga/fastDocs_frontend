import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { InstructionsSidebar } from "@/components/InstructionsSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CriarTemplate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const instructions = [
    "Use marcadores no formato {{campo}} para indicar os campos dinâmicos",
    "Exemplo: {{nome}}, {{data}}, {{valor}}",
    "Os campos serão automaticamente detectados e transformados em formulário",
    "Suporta arquivos .docx, .doc e .pdf",
    "Mantenha a formatação original do documento",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName || !file) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Template criado!",
      description: "Seu template foi cadastrado com sucesso.",
    });
    
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Template</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do template</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Contrato de Prestação de Serviços"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Arquivo do template</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Input
                        id="file"
                        type="file"
                        accept=".doc,.docx,.pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label
                        htmlFor="file"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">
                            {file ? file.name : "Clique para fazer upload"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Formatos suportados: .doc, .docx, .pdf
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <Upload className="h-5 w-5 mr-2" />
                    Criar Template
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <InstructionsSidebar
              title="Como criar templates"
              instructions={instructions}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CriarTemplate;
