import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import InviteForm from './InviteForm'
import MemberCard from './MemberCard'

export default async function EquipePage() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  const membros = await prisma.user.findMany({
    orderBy: { nome: 'asc' },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipe</h1>
          <p className="page-subtitle">
            {membros.length} membro{membros.length !== 1 ? 's' : ''} registrado{membros.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Lista de membros */}
        <div className="col-span-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Membros</h2>
          <div className="space-y-2">
            {membros.map(m => (
              <MemberCard
                key={m.id}
                member={m}
                isCurrentUser={m.email === authUser?.email}
              />
            ))}
            {membros.length === 0 && (
              <p className="text-sm text-gray-400 py-4">Nenhum membro registrado</p>
            )}
          </div>
        </div>

        {/* Formulário de convite */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Convidar membro</h2>
          <InviteForm />
        </div>
      </div>
    </div>
  )
}
