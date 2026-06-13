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

  return <ProyekDetailClient project={project!} />
}
