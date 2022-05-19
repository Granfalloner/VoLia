import React from 'react';

const Header = (props) => {
  return (
    <div className="navbar bg-white">
      <div class="navbar-start">
        <a className="btn btn-ghost normal-case text-xl"><img src={`${process.env.PUBLIC_URL}/logo.png`} /></a>
        
      </div>
      <div className="navbar-end">
        <a className="btn">Connect Wallet</a>
      </div>
    </div>
  );
};
export default Header;
