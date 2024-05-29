import React, { useState } from 'react';

import { useParams } from 'react-router-dom';

function GetCode() {
  const { _id } = useParams();
  const api = 'http://localhost:3001/deals/discount/' + _id; // replace with your actual API URL
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(api);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // hide the message after 2 seconds
  };

  return (
    <div>
      <h3>Use any of the following option to display discounts on your site</h3>
      <h5> Use our API to build a custom solution</h5>
      <p>{api}</p>
      <button onClick={handleCopy}>Copy API</button>
      {copied && <p style={{ color: 'blue' }}>API copied to clipboard!</p>}
    </div>
  );
}

export default GetCode;
