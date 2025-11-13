import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { InstructionsSidebar } from "@/components/InstructionsSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileDown, Eraser } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PreencherTemplate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    endereco: "",
    data: "",
    valor: "",
    cidade: "",
  });

  const templateName = "Contrato de Prestação de Serviços";

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
    setFormData({
      nome: "",
      cpf: "",
      endereco: "",
      data: "",
      valor: "",
      cidade: "",
    });
    toast({
      title: "Formulário limpo",
      description: "Todos os campos foram resetados.",
    });
  };

  const handleGenerate = () => {
    const emptyFields = Object.entries(formData).filter(([_, value]) => !value);
    
    if (emptyFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para gerar o documento.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Documento gerado!",
      description: "Seu documento está pronto para download.",
    });
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
                <CardTitle>Preencher Template - {templateName}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome completo</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => handleChange("nome", e.target.value)}
                        placeholder="João da Silva"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => handleChange("cpf", e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="endereco">Endereço completo</Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => handleChange("endereco", e.target.value)}
                        placeholder="Rua, número, bairro"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => handleChange("cidade", e.target.value)}
                        placeholder="São Paulo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data">Data</Label>
                      <Input
                        id="data"
                        type="date"
                        value={formData.data}
                        onChange={(e) => handleChange("data", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor</Label>
                      <Input
                        id="valor"
                        value={formData.valor}
                        onChange={(e) => handleChange("valor", e.target.value)}
                        placeholder="R$ 1.000,00"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClear}
                      className="flex-1"
                    >
                      <Eraser className="h-4 w-4 mr-2" />
                      Limpar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleGenerate}
                      className="flex-1"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Gerar Documento
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
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
