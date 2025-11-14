import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { InstructionsSidebar } from "@/components/InstructionsSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileDown, Eraser, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { templateService, Placeholder } from "@/services/templateService";

const PreencherTemplate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await templateService.getTemplatePlaceholders(id);
      setTemplateName(data.title);
      setPlaceholders(data.placeholders);
      
      // Initialize form data with empty values
      const initialData: Record<string, string> = {};
      data.placeholders.forEach((p) => {
        initialData[p.name] = "";
      });
      setFormData(initialData);
    } catch (error) {
      toast({
        title: "Erro ao carregar template",
        description: "Não foi possível carregar os dados do template.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const instructions = [
    "Preencha todos os campos obrigatórios",
    "Verifique a formatação de datas e valores",
    "CPF deve estar no formato 000.000.000-00",
    "Revise todas as informações antes de gerar",
    "O documento será gerado no formato original do template",
  ];

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleClear = () => {
    const clearedData: Record<string, string> = {};
    placeholders.forEach((p) => {
      clearedData[p.name] = "";
    });
    setFormData(clearedData);
    toast({
      title: "Formulário limpo",
      description: "Todos os campos foram resetados.",
    });
  };

  const handleGenerate = async () => {
    if (!id) return;

    const emptyFields = Object.entries(formData).filter(([_, v]) => !v);

    if (emptyFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para gerar o documento.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);
      const blob = await templateService.generateDocument(id, formData);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Documento gerado!",
        description: "Seu documento foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar documento",
        description: "Não foi possível gerar o documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        
        {/* Botão voltar */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className={`mb-6 ${isMobile ? "w-full justify-center" : ""}`}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Grid responsivo */}
        <div
          className={`grid gap-8 ${
            isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
          }`}
        >
          {/* Formulário */}
          <div className={isMobile ? "" : "lg:col-span-2"}>
            <Card>
              <CardHeader>
                <CardTitle
                  className={isMobile ? "text-xl" : "text-2xl"}
                >
                  Preencher Template — {templateName}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <form className="space-y-6">
                  
                  {/* Grid inputs */}
                  <div
                    className={`grid gap-4 ${
                      isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                    }`}
                  >
                    {placeholders.map((placeholder) => (
                      <div 
                        key={placeholder.name}
                        className={`space-y-2 ${
                          placeholder.type === "textarea" && !isMobile ? "md:col-span-2" : ""
                        }`}
                      >
                        <Label htmlFor={placeholder.name}>
                          {placeholder.label}
                        </Label>
                        <Input
                          id={placeholder.name}
                          type={placeholder.type === "date" ? "date" : "text"}
                          value={formData[placeholder.name] || ""}
                          onChange={(e) => handleChange(placeholder.name, e.target.value)}
                          placeholder={`Digite ${placeholder.label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Botões */}
                  <div
                    className={`flex gap-3 pt-4 ${
                      isMobile ? "flex-col" : ""
                    }`}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClear}
                      className={isMobile ? "w-full" : "flex-1"}
                    >
                      <Eraser className="h-4 w-4 mr-2" />
                      Limpar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleGenerate}
                      disabled={generating}
                      className={isMobile ? "w-full" : "flex-1"}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <FileDown className="h-4 w-4 mr-2" />
                          Gerar Documento
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className={isMobile ? "order-[-1]" : ""}>
            <InstructionsSidebar
              title="Instruções de preenchimento"
              instructions={instructions}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PreencherTemplate;
