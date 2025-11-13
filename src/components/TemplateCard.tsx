import { FileText, Calendar, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TemplateCardProps {
  id: string;
  title: string;
  extension: string;
  fieldsCount: number;
  createdAt: string;
  onFill: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TemplateCard({
  id,
  title,
  extension,
  fieldsCount,
  createdAt,
  onFill,
  onDelete,
}: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">{title}</h3>
              <Badge variant="secondary" className="mt-1">
                {extension}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            <span>{fieldsCount} campos</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{createdAt}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button onClick={() => onFill(id)} className="flex-1">
          Preencher
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
