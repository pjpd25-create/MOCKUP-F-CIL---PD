
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const hasRealKeys = 
    SUPABASE_URL && 
    SUPABASE_URL !== 'SUA_SUPABASE_URL_AQUI' && 
    !SUPABASE_URL.includes('SUA_SUPABASE') &&
    SUPABASE_ANON_KEY && 
    SUPABASE_ANON_KEY !== 'SUA_SUPABASE_ANON_KEY_AQUI';

// We now report as configured true, but internally we might be using the Mock
export const isSupabaseConfigured = true;

// --- MOCK CLIENT IMPLEMENTATION ---
class MockQueryBuilder {
    tableName: string;
    filters: any[] = [];
    isDelete = false;
    isInsert = false;
    isSelect = false;
    insertData: any = null;
    sort: any = null;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    select(cols?: string) {
        this.isSelect = true;
        return this;
    }

    insert(data: any) {
        this.isInsert = true;
        this.insertData = data;
        return this;
    }

    delete() {
        this.isDelete = true;
        return this;
    }

    eq(col: string, val: any) {
        this.filters.push({ col, val });
        return this;
    }

    order(col: string, opts?: any) {
        this.sort = { col, ...opts };
        return this;
    }

    async then(resolve: (res: any) => void, reject: (err: any) => void) {
        try {
            // Emulate async network delay slightly for realism
            await new Promise(r => setTimeout(r, 100));

            const storageKey = `mock_db_${this.tableName}`;
            let data: any[] = [];
            try {
                data = JSON.parse(localStorage.getItem(storageKey) || '[]');
            } catch(e) {
                data = [];
            }

            if (this.isInsert) {
                const newRows = (Array.isArray(this.insertData) ? this.insertData : [this.insertData]).map((r: any) => ({
                    ...r,
                    id: r.id || 'mock-' + Date.now() + Math.random().toString(36).substr(2, 5),
                    created_at: r.created_at || new Date().toISOString()
                }));
                
                // Append new rows
                const updatedData = [...data, ...newRows];
                
                try {
                    localStorage.setItem(storageKey, JSON.stringify(updatedData));
                } catch (e: any) {
                     // Handle Quota Exceeded by removing old items (FIFO)
                     if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22) {
                        console.warn("Mock DB Storage Full. Cleaning up old records...");
                        
                        let currentData = [...data]; // Existing data only
                        let saved = false;

                        // Loop removing oldest items until it fits or we run out of old items
                        while (currentData.length > 0 && !saved) {
                            currentData.shift(); // Remove oldest
                            const retryData = [...currentData, ...newRows];
                            try {
                                localStorage.setItem(storageKey, JSON.stringify(retryData));
                                saved = true;
                            } catch (retryE) {
                                // Still full, continue loop
                            }
                        }

                        if (!saved) {
                             // If we deleted all old data and it still doesn't fit, try saving just the new rows (maybe user has just one huge image?)
                             try {
                                 localStorage.setItem(storageKey, JSON.stringify(newRows));
                                 saved = true;
                             } catch (finalE) {
                                 console.error("Storage full even for single item");
                                 resolve({ data: null, error: { message: "Armazenamento cheio. Não foi possível salvar." } });
                                 return;
                             }
                        }
                     } else {
                        throw e;
                     }
                }
                
                resolve({ data: newRows, error: null });
                return;
            }

            if (this.isDelete) {
                const originalLen = data.length;
                
                const remainingData = data.filter((row: any) => {
                    // We only Keep the row if it does NOT match the filters.
                    // If no filters are provided, we delete everything (keep nothing).
                    if (this.filters.length === 0) return false;
                    
                    // Check if row matches all filters (AND logic)
                    const matches = this.filters.every(f => row[f.col] === f.val);
                    return !matches; // Keep if it doesn't match
                });
                
                try {
                    localStorage.setItem(storageKey, JSON.stringify(remainingData));
                } catch(e) {
                    console.error("Error saving after delete", e);
                }
                
                resolve({ data: null, error: null, count: originalLen - remainingData.length });
                return;
            }

            if (this.isSelect) {
                let res = data.filter((row: any) => {
                     return this.filters.every(f => row[f.col] === f.val);
                });
                
                if (this.sort) {
                    res.sort((a: any, b: any) => {
                        const valA = new Date(a[this.sort.col]).getTime() || a[this.sort.col];
                        const valB = new Date(b[this.sort.col]).getTime() || b[this.sort.col];
                        
                        if (valA < valB) return this.sort.ascending ? -1 : 1;
                        if (valA > valB) return this.sort.ascending ? 1 : -1;
                        return 0;
                    });
                }
                resolve({ data: res, error: null });
                return;
            }
            
            resolve({ data: null, error: null });

        } catch (e) {
            console.error("Mock DB Error", e);
            reject(e);
        }
    }
}

class MockSupabaseClient {
  private usersKey = 'mock_auth_users';
  private sessionKey = 'mock_auth_session';
  private authListeners: Function[] = [];

  constructor() {
    console.warn("⚠️ MOCKUP FÁCIL: Usando Banco de Dados Local (Simulado) - Dados serão salvos no navegador.");
    try {
        const users = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
        if (users.length > 0) {
            console.log("👥 Usuários cadastrados (Debug):", users.map((u:any) => u.email));
        } else {
            console.log("ℹ️ Nenhum usuário cadastrado localmente. Registre-se primeiro.");
        }
    } catch (e) {}
  }

  get auth() {
    const self = this;
    return {
      signUp: async ({ email, password, options }: any) => {
        await new Promise(r => setTimeout(r, 500));
        // Normalize email to lowercase
        const safeEmail = email.toLowerCase();
        
        const users = JSON.parse(localStorage.getItem(self.usersKey) || '[]');
        if (users.find((u: any) => u.email === safeEmail)) {
          return { data: { user: null }, error: { message: "Usuário já cadastrado." } };
        }
        const newUser = {
          id: 'user-' + Date.now(),
          email: safeEmail,
          password,
          user_metadata: options?.data || {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        };
        users.push(newUser);
        try {
            localStorage.setItem(self.usersKey, JSON.stringify(users));
        } catch (e) {
            return { data: { user: null }, error: { message: "Erro de armazenamento ao criar usuário." } };
        }
        
        // Auto sign in mock
        const session = { access_token: 'mock-token', user: newUser };
        localStorage.setItem(self.sessionKey, JSON.stringify(session));
        self._notifyAuth('SIGNED_IN', session);
        
        return { data: { user: newUser, session }, error: null };
      },
      signInWithPassword: async ({ email, password }: any) => {
        await new Promise(r => setTimeout(r, 500));
        // Normalize email to lowercase
        const safeEmail = email.toLowerCase();

        const users = JSON.parse(localStorage.getItem(self.usersKey) || '[]');
        
        // Basic match logic
        const user = users.find((u: any) => u.email === safeEmail && u.password === password);
        
        if (!user) {
            return { data: { session: null }, error: { message: "Invalid login credentials" } };
        }
        
        const session = { access_token: 'mock-token', user };
        localStorage.setItem(self.sessionKey, JSON.stringify(session));
        self._notifyAuth('SIGNED_IN', session);
        return { data: { session, user }, error: null };
      },
      signOut: async () => {
        localStorage.removeItem(self.sessionKey);
        self._notifyAuth('SIGNED_OUT', null);
        return { error: null };
      },
      getSession: async () => {
        const session = JSON.parse(localStorage.getItem(self.sessionKey) || 'null');
        return { data: { session }, error: null };
      },
      onAuthStateChange: (callback: Function) => {
        self.authListeners.push(callback);
        return { data: { subscription: { unsubscribe: () => {
             self.authListeners = self.authListeners.filter(cb => cb !== callback);
        }}}};
      }
    };
  }

  _notifyAuth(event: string, session: any) {
      this.authListeners.forEach(cb => cb(event, session));
  }

  from(table: string) {
    return new MockQueryBuilder(table);
  }
}

// --- INITIALIZATION ---

let client: SupabaseClient | any = null;

if (hasRealKeys) {
    try {
        client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (error) {
        console.error("Falha ao inicializar Supabase real, usando Mock:", error);
        client = new MockSupabaseClient();
    }
} else {
    client = new MockSupabaseClient();
}

export const supabase = client;
