import { Home, Upload, Calendar, FileText } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Início", url: "/", icon: Home },
  { title: "Upload Template", url: "/criar-template", icon: Upload },
  { title: "Calendário", url: "/calendario", icon: Calendar },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        <div className="px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">FastDocs</h1>
              <h2 className="text-sm text-sidebar-foreground/70">Gerador de documentos</h2>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-xs px-6">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
