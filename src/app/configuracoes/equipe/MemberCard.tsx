'use client'

type Member = {
  id:        string
  email:     string
  nome:      string
  createdAt: Date
}

export default function MemberCard({ member, isCurrentUser }: { member: Member; isCurrentUser: boolean }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
        <span className="text-indigo-700 font-semibold text-sm">
          {member.nome.slice(0, 2).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">
          {member.nome}
          {isCurrentUser && <span className="text-xs text-gray-400 ml-2">(você)</span>}
        </p>
        <p className="text-xs text-gray-500 truncate">{member.email}</p>
        <p className="text-xs text-gray-400">
          Desde {new Date(member.createdAt).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <span className="badge bg-blue-100 text-blue-700 text-xs flex-shrink-0">Membro</span>
    </div>
  )
}
