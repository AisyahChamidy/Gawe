import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProyekDetailClient from './ProyekDetailClient'

export default async function ProyekDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const [{ data: clientProfile }, { count: totalProjects }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, created_at, trust_score, city')
      .eq('id', project!.client_id)
      .single(),
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', project!.client_id)
      .eq('status', 'completed'),
  ])

  return (
    <ProyekDetailClient
      project={project!}
      clientProfile={clientProfile}
      clientCompletedProjects={totalProjects ?? 0}
    />
  )
}
