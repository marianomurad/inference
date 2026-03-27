import { Mail, Phone, Building2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ContactStatusBadge } from "./contact-status-badge"
import type { Contact } from "@/lib/api/contacts"

export function ContactProfileCard({ contact }: { contact: Contact }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-semibold text-xl shrink-0">
            {contact.firstName[0]}{contact.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-semibold text-white">
                {contact.firstName} {contact.lastName}
              </h2>
              <ContactStatusBadge status={contact.status} />
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Mail className="h-3.5 w-3.5" /> {contact.email}
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Phone className="h-3.5 w-3.5" /> {contact.phone}
                </div>
              )}
              {contact.companyName && (
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Building2 className="h-3.5 w-3.5" /> {contact.companyName}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
