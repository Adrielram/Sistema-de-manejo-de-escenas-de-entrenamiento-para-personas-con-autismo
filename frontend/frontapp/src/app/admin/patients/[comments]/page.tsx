import Comentario from "../../../../components/Comentario";


export default async function Comments({ params }: { params: Promise<{ comments: string }> }) {
  const { comments } = await params;  
  return (
    <>      
      <Comentario dni={comments}/>    
    </>
  )  
}

