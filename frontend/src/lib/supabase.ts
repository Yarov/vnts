// Stub temporal - Retorna datos vacíos para hooks de reportes
const createChainableQuery = (): any => ({
  select: () => createChainableQuery(),
  eq: () => createChainableQuery(),
  gte: () => createChainableQuery(),
  lte: () => createChainableQuery(),
  order: () => createChainableQuery(),
  in: () => createChainableQuery(),
  single: () => Promise.resolve({ data: null, error: null }),
  maybeSingle: () => Promise.resolve({ data: null, error: null }),
  then: (resolve: any) => resolve({ data: [], error: null })
});

export const supabase = {
  from: () => createChainableQuery(),
  rpc: () => Promise.resolve({ data: null, error: null }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  channel: () => ({
    on: () => ({
      subscribe: () => {}
    })
  }),
  removeChannel: () => {}
};
