import ScrollVerticalYHorizontal  from "../../components/ScrollVerticalYHorizontal";

export default function LoginPage() {
    return (
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 p-4">
            <ScrollVerticalYHorizontal/>
          </div>
          <div className="w-full md:w-2/3 p-4 flex items-center justify-center">
            <div className="bg-blue-500 w-64 h-64 flex items-center justify-center text-white text-xl font-bold rounded">
              Cuadrado
            </div>
          </div>
        </div>
      );
    }