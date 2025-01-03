import BigButton from "@/components/BigButton";
import SmallButton from "@/components/SmallButton";
//import { Button } from "@headlessui/react";

export default function Home() {
  return (
    <>      
      <div className="flex justify-center gap-3">
        <SmallButton font_bold="font-bold" title="Volver"/>
        <SmallButton font_bold="font-bold" title="Cancelar cambios"/>
        <SmallButton color="bg-[#12509d]" title="Guardar" hover="hover:bg-[#125080]"/>
      </div>
      <div>
        <BigButton title="Asistir a una clase"/>
        <BigButton title="Objetivo 6 con mucho texto para probar el ajuste pero veo que no se rebalsaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"/>
      </div>
    </>
  );
}