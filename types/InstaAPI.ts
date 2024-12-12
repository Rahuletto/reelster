export interface Owner {
    username: string;
    full_name: string;
    is_verified: boolean;
    is_private: boolean;
}

export interface MediaData {
    is_video: boolean;
    dimensions: {
        height: number;
        width: number;
    };
    video_view_count?: number;
    video_url?: string;
    display_url: string;
}

export interface RequestData {
    owner: Owner;
    edge_media_preview_like: {
        count: number;
    };
    is_ad: boolean;
    is_video: boolean;
    video_url?: string;
    display_url: string;
    edge_sidecar_to_children?: {
        edges: {
            node: MediaData;
        }[];
    };
    __typename: string;
}

export interface PostInfo {
    owner_username: string;
    owner_fullname: string;
    is_verified: boolean;
    is_private: boolean;
    likes: number;
    is_ad: boolean;
}

export interface MediaDetails {
    type: "video" | "image";
    dimensions: {
        height: number;
        width: number;
    };
    video_view_count?: number;
    url: string;
    thumbnail?: string;
}

export interface OutputData {
    results_number: number;
    url_list: string[];
    post_info: PostInfo;
    media_details: MediaDetails[];
}