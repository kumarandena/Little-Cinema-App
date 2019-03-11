
export interface Movie {
    title: string,
    imageSrc: string,
    rating: string,
    duration: string,
    descriptions: string[],
    cast: { imgSrc: string, name: string, role: string }[],
    bookmark: boolean,
    trailer: string,
    synopsis: string
}