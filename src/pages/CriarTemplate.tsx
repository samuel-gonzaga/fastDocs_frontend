import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { InstructionsSidebar } from "@/components/InstructionsSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { templateService } from "@/services/templateService";

const CriarTemplate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [templateName, setTemplateName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const instructions = [
    "Use marcadores no formato {{campo}} para indicar os campos dinâmicos",
    "Exemplo: {{nome}}, {{data}}, {{valor}}",
    "Os campos serão automaticamente detectados e transformados em formulário",
    "Suporta arquivos .docx, .doc e .pdf",
    "Mantenha a formatação original do documento",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName || !file) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('name', templateName);
      formData.append('file', file);

      await templateService.createTemplate(formData);

      toast({
        title: "Template criado!",
        description: "Seu template foi cadastrado com sucesso.",
      });

      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      toast({
        title: "Erro ao criar template",
        description: "Não foi possível cadastrar o template. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">

        {/* Botão voltar responsivo */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-2 md:mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {isMobile ? "Voltar" : "Voltar para início"}
        </Button>

        <div
          className={`grid gap-8 ${
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
          }`}
        >
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className={isMobile ? "shadow-md" : ""}>
              <CardHeader className={isMobile ? "pb-2" : ""}>
                <CardTitle className="text-lg md:text-xl">
                  Criar Novo Template
                </CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Nome do template */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do template</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Contrato de Prestação de Serviços"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="text-sm md:text-base"
                    />
                  </div>

                  {/* Arquivo */}
                  <div className="space-y-2">
                    <Label htmlFor="file">Arquivo do template</Label>

                    <div
                      className={`
                        border-2 border-dashed border-border rounded-lg 
                        p-6 md:p-8 text-center transition-colors cursor-pointer
                        hover:border-primary
                        ${isMobile ? "py-10" : ""}
                      `}
                    >
                      <Input
                        id="file"
                        type="file"
                        accept=".doc,.docx,.pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />

                      <label
                        htmlFor="file"
                        className="cursor-pointer flex flex-col items-center gap-3"
                      >
                        <Upload
                          className="text-muted-foreground"
                          size={isMobile ? 36 : 44}
                        />

                        <div>
                          <p className="font-medium text-foreground text-sm md:text-base">
                            {file ? file.name : "Clique para fazer upload"}
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Formatos: .doc, .docx, .pdf
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size={isMobile ? "default" : "lg"}
                    className="w-full"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2" />
                        Criar Template
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar de instruções (vai para baixo no mobile) */}
          <div className={isMobile ? "order-last" : ""}>
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
