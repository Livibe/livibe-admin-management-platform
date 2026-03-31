import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { users } from "@/lib/mock-data"
import { Upload, RefreshCw, Users } from "lucide-react"

export default function SettingsPage() {
  return (
    <div>
      <Topbar title="Settings" />
      <div className="p-6 space-y-5 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4" />Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-sm font-bold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium capitalize">{user.role}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4">+ Invite Team Member</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Upload className="w-4 h-4" />Import from Google Sheets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Upload a CSV export from your Google Sheets customer list, or connect directly via Google Sheets API.</p>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">Drop CSV file here or click to upload</p>
              <p className="text-xs text-slate-400 mt-1">Supports: Company, Contact, Email, Phone, Country, Industry, Status</p>
              <Button variant="outline" size="sm" className="mt-4">Choose File</Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <Button variant="outline" className="w-full gap-2">
              <RefreshCw className="w-4 h-4" />
              Connect Google Sheets
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
