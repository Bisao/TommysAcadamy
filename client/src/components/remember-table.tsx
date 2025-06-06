
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RememberItem {
  number: string;
  english: string;
  portuguese: string;
}

const rememberData: RememberItem[] = [
  { number: "01", english: "About", portuguese: "Sobre" },
  { number: "02", english: "After", portuguese: "Depois De" },
  { number: "03", english: "Away", portuguese: "Embora" },
  { number: "04", english: "Anyway", portuguese: "De Qualquer Forma" },
  { number: "05", english: "Otherwise", portuguese: "De Outra Forma" },
  { number: "06", english: "Before", portuguese: "Antes De" },
  { number: "07", english: "Besides", portuguese: "Além De" },
  { number: "08", english: "Despite", portuguese: "Apesar De" },
  { number: "09", english: "Even", portuguese: "Até, Mesmo" },
  { number: "10", english: "Even Though", portuguese: "Apesar De" },
  { number: "11", english: "Except", portuguese: "Exceto" },
  { number: "12", english: "Instead", portuguese: "Ao Invés De" },
  { number: "13", english: "However", portuguese: "Contudo" },
  { number: "14", english: "If", portuguese: "Se" },
  { number: "15", english: "Meanwhile", portuguese: "Enquanto Isso" },
  { number: "16", english: "Moreover", portuguese: "Além Disso" },
  { number: "17", english: "Nevertheless", portuguese: "Mesmo Assim" },
  { number: "18", english: "Because", portuguese: "Porque" },
  { number: "19", english: "Perhaps", portuguese: "Possivelmente" },
  { number: "20", english: "Rather Than", portuguese: "Ao Invés De" },
  { number: "21", english: "Such As", portuguese: "Tal Como" },
  { number: "22", english: "Therefore", portuguese: "Portanto" },
  { number: "23", english: "Unless", portuguese: "A Menos Que" },
  { number: "24", english: "Until", portuguese: "Até Quando" }
];

export default function RememberTable() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-red-500 text-white">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <span className="bg-white text-red-500 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">4</span>
          Remember
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-1 bg-gray-100">
          {rememberData.map((item) => (
            <div key={item.number} className="bg-white border border-gray-300 p-3">
              <div className="flex justify-between items-start">
                <span className="font-bold text-red-500 text-sm">{item.number}</span>
              </div>
              <div className="mt-1">
                <div className="font-semibold text-sm">{item.english}</div>
                <div className="text-gray-600 text-xs italic">{item.portuguese}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
