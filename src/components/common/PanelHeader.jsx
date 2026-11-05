import React from 'react';

export function PanelHeader({ title, subtitle, action }) {
  return (
    <div className="panel-header">
      <div><h2>{title}</h2><p>{subtitle}</p></div>
      {action}
    </div>
  );
}
