import { ReportData, WCAGLevel, WCAGResult } from '../types';

export const WCAG22_TEMPLATE: ReportData = {
  meta: {
    client: '',
    product: '',
    date: '',
    version: '',
    researchers: ''
  },
  scope: {
    inScope: [],
    outScope: []
  },
  summary: {
    conclusion: 'De analyse is voltooid.',
    feedback: '',
    scores: {
      wcag21: { pass: 0, total: 0 },
      wcag22: { pass: 0, total: 0 }
    }
  },
  principles: [
    {
      name: 'Waarneembaar',
      description: 'Alle gebruikers kunnen informatie en componenten waarnemen.',
      stats: { pass: 0, fail: 0, total: 0 },
      criteria: [
        { id: '1.1.1', name: 'Niet-tekstuele content', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Alle niet-tekstuele content die aan de gebruiker wordt gepresenteerd, heeft een tekstalternatief dat een gelijkwaardig doel dient.', disciplines: 'CMS, FE, Content' },
        { id: '1.2.1', name: 'Louter-geluid en louter-videobeeld (vooraf opgenomen)', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Louter-geluid en louter-videobeeld content heeft een alternatief.', disciplines: 'UX/UI, CMS, FE, Content' },
        { id: '1.2.2', name: 'Ondertitels voor doven en slechthorenden (vooraf opgenomen)', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Ondertitels worden geleverd voor alle vooraf opgenomen audiocontent.', disciplines: 'Content' },
        { id: '1.2.3', name: 'Audiodescriptie of media-alternatief (vooraf opgenomen)', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Alternatief voor op tijd gebaseerde media of audiodescriptie wordt geleverd.', disciplines: 'Content' },
        { id: '1.2.4', name: 'Ondertitels voor doven en slechthorenden (live)', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Ondertitels worden geleverd voor alle live audiocontent.', disciplines: 'Content' },
        { id: '1.2.5', name: 'Audiodescriptie (vooraf opgenomen)', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Audiodescriptie wordt geleverd voor alle vooraf opgenomen videocontent.', disciplines: 'Content' },
        { id: '1.3.1', name: 'Info en relaties', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Informatie, structuur en relaties kunnen door software worden bepaald of zijn in tekst beschikbaar.', disciplines: 'UX/UI, FE, Content' },
        { id: '1.3.2', name: 'Betekenisvolle volgorde', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Correcte leesvolgorde kan door software worden bepaald.', disciplines: 'FE' },
        { id: '1.3.3', name: 'Zintuiglijke eigenschappen', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Instructies zijn niet louter afhankelijk van zintuiglijke eigenschappen.', disciplines: 'UX/UI' },
        { id: '1.3.4', name: 'Weergavestand', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Content beperkt de weergave en bediening niet tot een enkele weergavestand.', disciplines: 'UX/UI, FE' },
        { id: '1.3.5', name: 'Identificeer het doel van de input', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Het doel van elk invoerveld kan door software worden bepaald.', disciplines: 'UX/UI, FE' },
        { id: '1.4.1', name: 'Gebruik van kleur', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Kleur wordt niet als enige visuele middel gebruikt.', disciplines: 'UX/UI, Content' },
        { id: '1.4.2', name: 'Geluidsbediening', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Audio die automatisch afspeelt kan worden gepauzeerd of gestopt.', disciplines: 'UX/UI, FE' },
        { id: '1.4.3', name: 'Contrast (minimum)', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Visuele weergave van tekst heeft een contrastverhouding van ten minste 4,5:1.', disciplines: 'UX/UI' },
        { id: '1.4.4', name: 'Herschalen van tekst', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Tekst kan tot 200% worden herschaald zonder verlies van content.', disciplines: 'UX/UI, FE' },
        { id: '1.4.5', name: 'Afbeeldingen van tekst', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Gebruik tekst in plaats van afbeeldingen van tekst.', disciplines: 'UX/UI, FE' },
        { id: '1.4.10', name: 'Reflow', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Content kan worden gepresenteerd zonder verlies van informatie bij 320px breedte.', disciplines: 'UX/UI, FE' },
        { id: '1.4.11', name: 'Contrast van niet-tekstuele content', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Visuele weergave van UI componenten en grafische objecten heeft contrast van 3:1.', disciplines: 'UX/UI' },
        { id: '1.4.12', name: 'Tekstafstand', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Geen verlies van content of functionaliteit bij aanpassen tekstafstand.', disciplines: 'UX/UI, FE' },
        { id: '1.4.13', name: 'Content bij hover of focus', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Extra content bij hover of focus is beheersbaar.', disciplines: 'UX/UI, FE' }
      ]
    },
    {
      name: 'Bedienbaar',
      description: 'Alle gebruikers kunnen componenten en navigatie bedienen.',
      stats: { pass: 0, fail: 0, total: 0 },
      criteria: [
        { id: '2.1.1', name: 'Toetsenbord', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Alle functionaliteit is bedienbaar via een toetsenbord.', disciplines: 'FE' },
        { id: '2.1.2', name: 'Geen toetsenbordval', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Geen toetsenbordval (keyboard trap).', disciplines: 'FE' },
        { id: '2.1.4', name: 'Enkel teken sneltoetsen', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Sneltoetsen met enkel teken kunnen worden uitgezet of aangepast.', disciplines: 'FE' },
        { id: '2.2.1', name: 'Timing aanpasbaar', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Tijdslimieten kunnen worden aangepast.', disciplines: 'UX/UI, FE, Content' },
        { id: '2.2.2', name: 'Pauzeren, stoppen, verbergen', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Bewegende content kan worden gepauzeerd, gestopt of verborgen.', disciplines: 'UX/UI, FE' },
        { id: '2.3.1', name: 'Drie flitsen of beneden drempelwaarde', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Geen content die meer dan drie keer per seconde flitst.', disciplines: 'UX/UI, FE' },
        { id: '2.4.1', name: 'Blokken omzeilen', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Mechanisme beschikbaar om herhalende blokken te omzeilen.', disciplines: 'UX/UI, FE' },
        { id: '2.4.2', name: 'Paginatitel', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Webpagina\'s hebben titels die het onderwerp of doel beschrijven.', disciplines: 'CMS, FE, Content' },
        { id: '2.4.3', name: 'Focus volgorde', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Focusbare componenten krijgen focus in een betekenisvolle volgorde.', disciplines: 'FE' },
        { id: '2.4.4', name: 'Linkdoel (in context)', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Het doel van elke link kan worden bepaald uit de linktekst of context.', disciplines: 'UX/UI, CMS, Content' },
        { id: '2.4.5', name: 'Meerdere manieren', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Meer dan één manier om een webpagina te vinden.', disciplines: 'UX/UI, Content' },
        { id: '2.4.6', name: 'Koppen en labels', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Koppen en labels beschrijven onderwerp of doel.', disciplines: 'UX/UI, FE, Content' },
        { id: '2.4.7', name: 'Focus zichtbaar', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'De interface toont een zichtbare indicator van de toetsenbordfocus.', disciplines: 'UX/UI, FE' },
        { id: '2.4.11', name: 'Focus niet verborgen (minimum)', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'De focusindicator wordt niet volledig verborgen door andere content.', disciplines: 'FE' },
        { id: '2.5.1', name: 'Aanwijzergebaren', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Alternatieve bediening voor multipoint of path-based gebaren.', disciplines: 'UX/UI, FE' },
        { id: '2.5.2', name: 'Aanwijzerannulering', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Functionaliteit kan worden geannuleerd of ongedaan gemaakt bij aanwijzerbediening.', disciplines: 'FE' },
        { id: '2.5.3', name: 'Label in naam', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'De toegankelijke naam bevat de zichtbare tekst van het label.', disciplines: 'FE' },
        { id: '2.5.4', name: 'Bewegingsactivering', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Functionaliteit via beweging kan ook via UI componenten worden bediend.', disciplines: 'UX/UI, FE' },
        { id: '2.5.7', name: 'Slepende bewegingen', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Alternatief voor slepende bewegingen.', disciplines: 'UX/UI, FE' },
        { id: '2.5.8', name: 'Grootte van het aanwijsgebied (minimum)', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Klikbaar gebied is minimaal 24x24 pixels.', disciplines: 'UX/UI, FE' }
      ]
    },
    {
      name: 'Begrijpelijk',
      description: 'Alle gebruikers kunnen informatie en bediening van de interface begrijpen.',
      stats: { pass: 0, fail: 0, total: 0 },
      criteria: [
        { id: '3.1.1', name: 'Taal van de pagina', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'De standaardtaal van de pagina kan door software worden bepaald.', disciplines: 'CMS, FE' },
        { id: '3.1.2', name: 'Taal van onderdelen', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Taal van passages kan door software worden bepaald.', disciplines: 'FE' },
        { id: '3.2.1', name: 'Bij focus', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Geen contextwijziging bij focus.', disciplines: 'FE' },
        { id: '3.2.2', name: 'Bij input', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Geen contextwijziging bij wijzigen instelling user interface component.', disciplines: 'UX/UI, FE' },
        { id: '3.2.3', name: 'Consistente navigatie', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Navigatiemechanismen die worden herhaald, staan in dezelfde volgorde.', disciplines: 'UX/UI, CMS' },
        { id: '3.2.4', name: 'Consistente identificatie', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Componenten met dezelfde functionaliteit worden consistent geïdentificeerd.', disciplines: 'UX/UI, FE' },
        { id: '3.2.6', name: 'Consistente hulp', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Hulpmechanismen staan op dezelfde relatieve positie.', disciplines: 'UX/UI, Content' },
        { id: '3.3.1', name: 'Foutidentificatie', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Invoerfouten worden geïdentificeerd en beschreven.', disciplines: 'UX/UI, FE' },
        { id: '3.3.2', name: 'Labels of instructies', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Labels of instructies worden geleverd wanneer content invoer vereist.', disciplines: 'UX/UI, CMS, FE, Content' },
        { id: '3.3.3', name: 'Foutsuggestie', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Indien een invoerfout wordt gedetecteerd, worden suggesties voor verbetering gegeven.', disciplines: 'UX/UI, FE' },
        { id: '3.3.4', name: 'Foutpreventie (wettelijk, financieel, gegevens)', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Voor webpagina\'s die juridische verplichtingen of financiële transacties aangaan, zijn er mechanismen om fouten te voorkomen.', disciplines: 'UX/UI, FE, BE' },
        { id: '3.3.7', name: 'Overbodige invoer', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Eerder ingevoerde informatie hoeft niet opnieuw te worden ingevoerd.', disciplines: 'UX/UI, FE, BE' },
        { id: '3.3.8', name: 'Toegankelijke authenticatie', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Cognitieve functietests zijn niet vereist voor authenticatie of er is een alternatief.', disciplines: 'UX/UI, FE, BE' }
      ]
    },
    {
      name: 'Robuust',
      description: 'Content is zo opgebouwd dat deze door hulptechnologie verwerkt kan worden.',
      stats: { pass: 0, fail: 0, total: 0 },
      criteria: [
        { id: '4.1.1', name: 'Parsen', level: WCAGLevel.A, result: WCAGResult.NA, description: 'Deze richtlijn is verwijderd in WCAG 2.2.', disciplines: 'FE, BE' },
        { id: '4.1.2', name: 'Naam, rol, waarde', level: WCAGLevel.A, result: WCAGResult.NOT_CHECKED, description: 'Naam, rol en waarde kunnen door software worden bepaald.', disciplines: 'FE, BE' },
        { id: '4.1.3', name: 'Statusberichten', level: WCAGLevel.AA, result: WCAGResult.NOT_CHECKED, description: 'Statusberichten kunnen door hulptechnologie worden bepaald zonder focus te verplaatsen.', disciplines: 'UX/UI, FE' }
      ]
    }
  ]
};