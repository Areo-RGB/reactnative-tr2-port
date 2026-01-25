import { Tool, ColorData } from './types';
import {
    Calculator,
    Droplet,
    Mic,
    Clock,
    Hourglass,
    Globe,
    ScanLine
} from 'lucide-react-native';

export const COLORS_DATA: ColorData[] = [
    { name: 'White', class: 'bg-white' },
    { name: 'Red', class: 'bg-red-500' },
    { name: 'Blue', class: 'bg-blue-500' },
    { name: 'Green', class: 'bg-green-500' },
    { name: 'Yellow', class: 'bg-yellow-500' },
    { name: 'Purple', class: 'bg-purple-500' },
    { name: 'Pink', class: 'bg-pink-500' },
    { name: 'Orange', class: 'bg-orange-500' },
    { name: 'Teal', class: 'bg-teal-500' },
];

export const TOOLS: Tool[] = [
    {
        id: 'colors',
        name: 'Farben',
        description: 'Reaktionstraining mit Stroop-Effekt und Audio-Steuerung',
        icon: Droplet,
        path: 'Colors',
        accentColor: 'border-purple-500',
        tags: ['Reaktion', 'Audio'],
    },
    {
        id: 'chain-calc',
        name: 'Kettenrechner',
        description: 'Mentales Kopfrechnen unter Zeitdruck',
        icon: Calculator,
        path: 'ChainCalculator',
        accentColor: 'border-green-500',
        tags: ['Mathe', 'Gedächtnis'],
    },
    {
        id: 'motion-detection',
        name: 'Motion Detection',
        description: 'Echtzeit-Bewegungserkennung mit virtuellem Tripwire',
        icon: ScanLine,
        path: 'MotionDetection',
        accentColor: 'border-red-500',
        tags: ['Kamera', 'Reaktion'],
    },
    // Other tools commented out as they are not part of the port yet
    /*
    {
      id: 'sound-counter',
      name: 'Sound Zähler',
      description: 'Zähle Ereignisse basierend auf Geräuschpegel',
      icon: Mic,
      path: 'SoundCounter',
      accentColor: 'border-blue-500',
      tags: ['Audio', 'Tool'],
    },
    */
];
