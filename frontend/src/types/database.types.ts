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
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          created_at: string
          last_login: string | null
          organization_id: string
          role: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          created_at?: string
          last_login?: string | null
          organization_id: string
          role?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          created_at?: string
          last_login?: string | null
          organization_id?: string
          role?: string
        }
      }
      app_settings: {
        Row: {
          id: string
          organization_id: string
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
      }
      branches: {
        Row: {
          id: string
          name: string
          code: string
          address: string
          phone: string
          active: boolean
          organization: string
          sellers?: string[]
          products?: string[]
          seller_count?: number
          product_count?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          address?: string
          phone?: string
          active?: boolean
          organization: string
          sellers?: string[]
          products?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          address?: string
          phone?: string
          active?: boolean
          sellers?: string[]
          products?: string[]
          updated_at?: string
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
          branch: string | null
          branch_name?: string
          assigned_branches?: Array<{id: string, name: string, code: string}>
          organization_id: string
        }
        Insert: {
          id?: string
          name: string
          numeric_code: string
          active?: boolean
          created_at?: string
          commission_percentage?: number
          branch?: string | null
          organization_id: string
        }
        Update: {
          id?: string
          name?: string
          numeric_code?: string
          active?: boolean
          created_at?: string
          commission_percentage?: number
          branch?: string | null
          organization_id?: string
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
          organization_id: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          category?: string | null
          description?: string | null
          active?: boolean
          created_at?: string
          organization_id: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          category?: string | null
          description?: string | null
          active?: boolean
          created_at?: string
          organization_id?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          name: string
          active: boolean
          commission_percentage: number
          organization_id: string
        }
        Insert: {
          id?: string
          name: string
          active?: boolean
          commission_percentage?: number
          organization_id: string
        }
        Update: {
          id?: string
          name?: string
          active?: boolean
          commission_percentage?: number
          organization_id?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          reference: string | null
          created_at: string
          organization_id: string
        }
        Insert: {
          id?: string
          name: string
          reference?: string | null
          created_at?: string
          organization_id: string
        }
        Update: {
          id?: string
          name?: string
          reference?: string | null
          created_at?: string
          organization_id?: string
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
          organization_id: string
        }
        Insert: {
          id?: string
          seller_id: string
          client_id?: string | null
          payment_method_id: string
          total: number
          notes?: string | null
          created_at?: string
          organization_id: string
        }
        Update: {
          id?: string
          seller_id?: string
          client_id?: string | null
          payment_method_id?: string
          total?: number
          notes?: string | null
          created_at?: string
          organization_id?: string
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
          organization_id: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          price: number
          subtotal: number
          organization_id: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          price?: number
          subtotal?: number
          organization_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_organization_id: {
        Args: Record<string, never>
        Returns: string
      }
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
      }
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
      }
      get_seller_commissions: {
        Args: {
          p_seller_id: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: {
          seller_id: string
          seller_name: string
          total_sales: number
          commission_percentage: number
          commission_amount: number
        }[]
      }
      get_all_seller_commissions: {
        Args: {
          p_start_date?: string
          p_end_date?: string
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
