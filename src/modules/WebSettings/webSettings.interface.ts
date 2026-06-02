

export interface IWebSettings {
    title: string;
    favicon?: string;
    favicon_key?: string;
    logo?: string;
    logo_key?: string;
    phone?: string;
    email?: string;
    address?: string;
    app_link_playstore?: string;
    app_link_ios?: string;
    facebook_link?: string;
    instagram_link?: string;
    twitter_link?: string;
    youtube_link?: string;
    whatsapp_link?: string;
    grocery_dynamic_section_name?: string;
    welcome_message?: string;
    privacy_policy?: string;
    terms?: string;
    demand_charge: number;
    delivery_charge: number;
    vat?: number; // percent
    upper_nav: string[];
};