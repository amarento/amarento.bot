export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      "amarento.id_account": {
        Row: {
          access_token: string | null;
          expires_at: number | null;
          id_token: string | null;
          provider: string;
          provider_account_id: string;
          refresh_token: string | null;
          scope: string | null;
          session_state: string | null;
          token_type: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          access_token?: string | null;
          expires_at?: number | null;
          id_token?: string | null;
          provider: string;
          provider_account_id: string;
          refresh_token?: string | null;
          scope?: string | null;
          session_state?: string | null;
          token_type?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          access_token?: string | null;
          expires_at?: number | null;
          id_token?: string | null;
          provider?: string;
          provider_account_id?: string;
          refresh_token?: string | null;
          scope?: string | null;
          session_state?: string | null;
          token_type?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "amarento.id_account_user_id_amarento.id_user_id_fk";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "amarento.id_user";
            referencedColumns: ["id"];
          }
        ];
      };
      "amarento.id_clients": {
        Row: {
          client_code: string;
          created_at: string;
          dinner_location: string | null;
          dinner_time: string | null;
          holmat_location: string | null;
          holmat_time: string | null;
          id: number;
          name_bride: string | null;
          name_groom: string | null;
          parents_name_bride: string | null;
          parents_name_groom: string | null;
          updated_at: string | null;
          wedding_day: string | null;
        };
        Insert: {
          client_code: string;
          created_at?: string;
          dinner_location?: string | null;
          dinner_time?: string | null;
          holmat_location?: string | null;
          holmat_time?: string | null;
          id?: number;
          name_bride?: string | null;
          name_groom?: string | null;
          parents_name_bride?: string | null;
          parents_name_groom?: string | null;
          updated_at?: string | null;
          wedding_day?: string | null;
        };
        Update: {
          client_code?: string;
          created_at?: string;
          dinner_location?: string | null;
          dinner_time?: string | null;
          holmat_location?: string | null;
          holmat_time?: string | null;
          id?: number;
          name_bride?: string | null;
          name_groom?: string | null;
          parents_name_bride?: string | null;
          parents_name_groom?: string | null;
          updated_at?: string | null;
          wedding_day?: string | null;
        };
        Relationships: [];
      };
      "amarento.id_guests": {
        Row: {
          client_id: number;
          created_at: string;
          guest_names: string | null;
          id: number;
          inv_names: string;
          n_rsvp_dinner_act: number | null;
          n_rsvp_dinner_wa: number | null;
          n_rsvp_holmat_act: number | null;
          n_rsvp_holmat_wa: number | null;
          n_rsvp_plan: number;
          rsvp_dinner: boolean | null;
          rsvp_holmat: boolean | null;
          updated_at: string | null;
          wa_number: string;
        };
        Insert: {
          client_id: number;
          created_at?: string;
          guest_names?: string | null;
          id?: number;
          inv_names: string;
          n_rsvp_dinner_act?: number | null;
          n_rsvp_dinner_wa?: number | null;
          n_rsvp_holmat_act?: number | null;
          n_rsvp_holmat_wa?: number | null;
          n_rsvp_plan: number;
          rsvp_dinner?: boolean | null;
          rsvp_holmat?: boolean | null;
          updated_at?: string | null;
          wa_number: string;
        };
        Update: {
          client_id?: number;
          created_at?: string;
          guest_names?: string | null;
          id?: number;
          inv_names?: string;
          n_rsvp_dinner_act?: number | null;
          n_rsvp_dinner_wa?: number | null;
          n_rsvp_holmat_act?: number | null;
          n_rsvp_holmat_wa?: number | null;
          n_rsvp_plan?: number;
          rsvp_dinner?: boolean | null;
          rsvp_holmat?: boolean | null;
          updated_at?: string | null;
          wa_number?: string;
        };
        Relationships: [
          {
            foreignKeyName: "amarento.id_guests_client_id_amarento.id_clients_id_fk";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "amarento.id_clients";
            referencedColumns: ["id"];
          }
        ];
      };
      "amarento.id_session": {
        Row: {
          expires: string;
          session_token: string;
          user_id: string;
        };
        Insert: {
          expires: string;
          session_token: string;
          user_id: string;
        };
        Update: {
          expires?: string;
          session_token?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "amarento.id_session_user_id_amarento.id_user_id_fk";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "amarento.id_user";
            referencedColumns: ["id"];
          }
        ];
      };
      "amarento.id_user": {
        Row: {
          email: string;
          email_verified: string | null;
          id: string;
          image: string | null;
          name: string | null;
        };
        Insert: {
          email: string;
          email_verified?: string | null;
          id: string;
          image?: string | null;
          name?: string | null;
        };
        Update: {
          email?: string;
          email_verified?: string | null;
          id?: string;
          image?: string | null;
          name?: string | null;
        };
        Relationships: [];
      };
      "amarento.id_verification_token": {
        Row: {
          expires: string;
          identifier: string;
          token: string;
        };
        Insert: {
          expires: string;
          identifier: string;
          token: string;
        };
        Update: {
          expires?: string;
          identifier?: string;
          token?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
