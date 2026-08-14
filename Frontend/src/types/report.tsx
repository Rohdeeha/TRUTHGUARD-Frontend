export interface IncidentReport {
    id?: number;
    title: string;
    category: string;
    location: string;
    details: string;
    is_anonymous: boolean;
    media?: File | null;           // Sent on POST
    media_url?: string | null;     // Received on GET from Django
    media_type?: 'image' | 'video' | 'audio' | '';
    created_at?: string;
}