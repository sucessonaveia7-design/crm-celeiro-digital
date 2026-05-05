const { data: { user } = {}, error } = await supabase.auth.getUser()
if (error) throw error
if (!user) throw new Error('not authenticated')

sender_id: user.id