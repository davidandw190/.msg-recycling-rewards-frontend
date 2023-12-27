import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly countyCitiesMap: Map<string, string[]> = new Map([
    ['ALBA', ['ALBA IULIA', 'BLAJ', 'SEBEȘ']],
    ['ARAD', ['ARAD', 'INEU', 'LIPOVA']],
    ['ARGEȘ', ['PITEȘTI', 'CÂMPULUNG', 'CURTEA DE ARGEȘ']],
    ['BACĂU', ['BACĂU', 'ONEȘTI', 'MOINEȘTI']],
    ['BIHOR', ['ORADEA', 'SALONTA', 'MARGHITA']],
    ['BISTRIȚA-NĂSĂUD', ['BISTRITA', 'NĂSĂUD', 'BECLEAN']],
    ['BOTOȘANI', ['BOTOȘANI', 'DOROHOI', 'DARABANI']],
    ['BRĂILA', ['BRĂILA', 'BUZĂU', 'FĂUREI']],
    ['BRAȘOV', ['BRAȘOV', 'RÂȘNOV', 'CODLEA']],
    ['BUZĂU', ['BUZĂU', 'RÂMNICU SĂRAT', 'NEHOIU']],
    ['CĂLĂRAȘI', ['CĂLĂRAȘI', 'OLTENIȚA', 'LEHLIU GARA']],
    ['CARAȘ-SEVERIN', ['REȘIȚA', 'CARANSEBEȘ', 'ORAVIȚA']],
    ['CLUJ', ['CLUJ-NAPOCA', 'TURDA', 'DEJ']],
    ['CONSTANȚA', ['CONSTANȚA', 'MEDGIDIA', 'MANGALIA']],
    ['COVASNA', ['SFÂNTU GHEORGHE', 'TÂRGU SECUIESC', 'COVASNA']],
    ['DÂMBOVIȚA', ['TÂRGOVIȘTE', 'MORENI', 'FIENI']],
    ['DOLJ', ['CRAIOVA', 'BĂILEȘTI', 'CALAFAT']],
    ['GALAȚI', ['GALAȚI', 'BRĂILA', 'TECUCI']],
    ['GIURGIU', ['GIURGIU', 'BOLINTIN-VALE', 'MIHAILESTI']],
    ['GORJ', ['TÂRGU JIU', 'MOTRU', 'ROVINARI']],
    ['HARGHITA', ['MIERCUREA CIUC', 'ODORHEIU SECUIESC', 'CRISTURU SECUIESC']],
    ['HUNEDOARA', ['DEVA', 'ORĂȘTIE', 'HUNEDOARA']],
    ['IALOMIȚA', ['SLOBOZIA', 'FETEȘTI', 'URZICENI']],
    ['IASI', ['IAȘI', 'PAȘCANI', 'BÂRLAD']],
    ['ILFOV', ['BUCUREȘTI', 'BUFTEA', 'PANTELIMON']],
    ['MARAMUREȘ', ['BAIA MARE', 'SIGHETU MARMAȚIEI', 'SEINI']],
    ['MEHEDINȚI', ['DROBETA-TURNU SEVERIN', 'STREHAIA', 'ORȘOVA']],
    ['MUREȘ', ['TÂRGU MUREȘ', 'SIGHIȘOARA', 'REGHIN']],
    ['NEAMȚ', ['PIATRA NEAMȚ', 'ROMAN', 'TÂRGU NEAMȚ']],
    ['OLT', ['SLATINA', 'CARACAL', 'CORABIA']],
    ['PRAHOVA', ['PLOIEȘTI', 'CÂMPINA', 'SINAIA']],
    ['SĂLAJ', ['ZALĂU', 'ȘIMLEU SILVANIEI', 'JIBOU']],
    ['SATU MARE', ['SATU MARE', 'CAREI', 'NEGREȘTI-OAȘ']],
    ['SIBIU', ['SIBIU', 'MEDIAȘ', 'CISNĂDIE']],
    ['SUCEAVA', ['SUCEAVA', 'RĂDĂUȚI', 'FĂLTICENI']],
    ['TELEORMAN', ['ALEXANDRIA', 'ROȘIORII DE VEDE', 'TURNU MĂGURELE']],
    ['TIMIȘ', ['TIMIȘOARA', 'LUGOJ', 'JIMBOLIA']],
    ['TULCEA', ['TULCEA', 'MĂCIN', 'BABADAG']],
    ['VÂLCEA', ['RÂMNICU VÂLCEA', 'DRĂGĂȘANI', 'BĂILEȘTI']],
    ['VASLUI', ['VASLUI', 'BARLAD', 'HUSI']],
    ['VRANCEA', ['FOCȘANI', 'ADJUD', 'PANCIU']],
  ]);

  private readonly validCounties: string[] = Array.from(this.countyCitiesMap.keys())

  constructor() {}

  getCitiesForCounty(county: string): string[] {
    return this.countyCitiesMap.get(county) || [];
  }

  getAllCounties(): string[] {
    return [...this.validCounties];
  }

  isValidCounty(county: string): boolean {
    return this.validCounties.includes(county);
  }
}
