import { AVAILABLE_VOICES } from '../constants.ts';

interface VoiceSelectorProps {
  id?: string;
  value: string;
  onChange: (voice: string) => void;
  className?: string;
}

const VoiceSelector = ({ id, value, onChange, className = '' }: VoiceSelectorProps) => (
  <select
    id={id}
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`bg-gray-900/50 border border-gray-700 text-gray-300 text-sm rounded px-2 py-1 focus:ring-1 focus:ring-cyan-500 outline-none ${className}`}
  >
    {AVAILABLE_VOICES.map(v => (
      <option key={v.name} value={v.name}>
        {v.name} ({v.description})
      </option>
    ))}
  </select>
);

export default VoiceSelector;
