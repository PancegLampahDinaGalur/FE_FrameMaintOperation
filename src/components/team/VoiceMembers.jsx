import React from 'react';
import { Icon } from '../common/Icon';
import { PanelHeader } from '../common/PanelHeader';
import { icons } from '../../constants/icons';
import { voiceMembers } from '../../data/team/voiceMockData';

export function VoiceMembers() {
  return (
    <section className="panel voice-panel">
      <PanelHeader title="Voice member" subtitle="Data demo — endpoint voice report belum tersedia" action={<button className="text-button">Manage <Icon name={icons.arrow} /></button>} />
      <div className="voice-table-wrap"><table className="voice-table"><thead><tr><th>Tanggal</th><th>Nama</th><th>Problem</th><th>Bahaya</th><th>Ideal</th><th>EVA</th></tr></thead><tbody>{voiceMembers.map((voice) => <tr key={voice.member}><td>{voice.date}</td><td><strong>{voice.member}</strong></td><td>{voice.problem}</td><td>{voice.danger}</td><td>{voice.ideal}</td><td><span className={`voice-close-status ${voice.eva === 'Close' ? 'closed' : 'open'}`}>{voice.eva}</span></td></tr>)}</tbody></table></div>
    </section>
  );
}
