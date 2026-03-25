import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function Reports() {
  const handleDownload = () => {
    window.print() // Simplification for PDF generation
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Gere resumos executivos em PDF
          </p>
        </div>
        <Button
          onClick={handleDownload}
          className="gap-2 bg-primary text-primary-foreground"
        >
          <Download className="h-4 w-4" /> Baixar PDF
        </Button>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Executivo (Mês Atual)</CardTitle>
            <CardDescription>
              Métricas chaves de desempenho da equipe comercial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/20 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">
                  Aquisição de Leads
                </h4>
                <p className="text-sm text-muted-foreground">
                  O volume de leads capturados via site (Vapt-Vupt e Cotação)
                  aumentou em 15% comparado ao período anterior. A taxa de
                  conversão de MQL para SQL se mantém em 42%.
                </p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg border border-border">
                <h4 className="font-semibold text-foreground mb-2">
                  Desempenho de Produtos
                </h4>
                <p className="text-sm text-muted-foreground">
                  Seguro Auto representa 65% das oportunidades abertas. O
                  Consórcio apresentou o maior crescimento (22%) após a
                  implantação da nova Landing Page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
