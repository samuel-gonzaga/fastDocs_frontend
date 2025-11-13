import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InstructionsSidebarProps {
  title: string;
  instructions: string[];
}

export function InstructionsSidebar({ title, instructions }: InstructionsSidebarProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {instructions.map((instruction, index) => (
            <li key={index} className="text-sm text-muted-foreground flex gap-2">
              <span className="text-primary font-semibold">{index + 1}.</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
