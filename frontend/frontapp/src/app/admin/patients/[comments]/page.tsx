import Comentario from "../../../../components/Comentario";

export default async function Comments({ params }: { params: Promise<{ comments: string }> }) {
  const { comments } = await params;
  return (
    <>
      <h1 className="text-black">Comentario ID: {comments}</h1>
      <Comentario />
    
    </>
  )  
}

