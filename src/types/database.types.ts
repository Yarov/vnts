export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          created_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          created_at?: string
          last_login?: string | null
        }
      }
      sellers: {
        Row: {
          id: string
          name: string
          numeric_code: string
          active: boolean
          created_at: string
          commission_percentage: number
        }
        Insert: {
          id?: string
          name: string
          numeric_code: string
          active?: boolean
          created_at?: string
          commission_percentage?: number
        }
        Update: {
          id?: string
          name?: string
          numeric_code?: string
          active?: boolean
          created_at?: string
          commission_percentage?: number
        }
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          category: string | null
          description: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          category?: string | null
          description?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          category?: string | null
          description?: string | null
          active?: boolean
          created_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          name: string
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          active?: boolean
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          reference: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          reference?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          reference?: string | null
          created_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          seller_id: string
          client_id: string | null
          payment_method_id: string
          total: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          client_id?: string | null
          payment_method_id: string
          total: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          client_id?: string | null
          payment_method_id?: string
          total?: number
          notes?: string | null
          created_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          price: number
          subtotal: number
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          price: number
          subtotal: number
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          price?: number
          subtotal?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_top_clients: {
        Args: {
          limit_count?: number
        }
        Returns: {
          id: string
          name: string
          reference: string | null
          created_at: string
          purchase_count: number
          last_purchase: string
        }[]
      },
      get_top_products: {
        Args: {
          limit_count?: number
        }
        Returns: {
          id: string
          name: string
          quantity: number
          total: number
        }[]
      },
      get_seller_commissions: {
        Args: {
          seller_id: string
          start_date?: string
          end_date?: string
        }
        Returns: {
          seller_id: string
          seller_name: string
          total_sales: number
          commission_percentage: number
          commission_amount: number
        }[]
      },
      get_all_seller_commissions: {
        Args: {
          start_date?: string
          end_date?: string
        }
        Returns: {
          seller_id: string
          seller_name: string
          total_sales: number
          commission_percentage: number
          commission_amount: number
        }[]
      }
    }
  }
}
