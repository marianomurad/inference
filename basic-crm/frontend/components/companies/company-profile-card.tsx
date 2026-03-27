import { Globe, Users, DollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Company } from "@/lib/api/companies"
import { formatCurrency } from "@/lib/utils"

export function CompanyProfileCard({ company }: { company: Company }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-semibold text-xl shrink-0">
            {company.name[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">{company.name}</h2>
            {company.industry && <p className="text-zinc-400 text-sm mt-0.5">{company.industry}</p>}
            <div className="mt-3 flex flex-wrap gap-4">
              {company.website && (
                <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                  <Globe className="h-3.5 w-3.5" />
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{company.website}</a>
                </div>
              )}
              {company.employeeCount && (
                <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                  <Users className="h-3.5 w-3.5" /> {company.employeeCount.toLocaleString()} employees
                </div>
              )}
              {company.annualRevenue && (
                <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                  <DollarSign className="h-3.5 w-3.5" /> {formatCurrency(company.annualRevenue)} revenue
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
