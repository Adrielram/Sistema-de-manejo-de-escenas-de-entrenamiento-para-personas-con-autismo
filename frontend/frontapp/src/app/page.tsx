import Button from "@/components/SmallButton";
//import { Button } from "@headlessui/react";

export default function Home() {
  return (
    <>      
      <div className="flex justify-center gap-3">
        <Button font_bold="font-bold" title="Volver"/>
        <Button font_bold="font-bold" title="Cancelar cambios"/>
        <Button color="bg-[#12509d]" title="Guardar" hover="hover:bg-[#125080]"/>
      </div>
    </>
  );
}