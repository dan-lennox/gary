import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Header extends Component {
  renderContent() {
    //console.log('status', this.props.auth);
    switch(this.props.auth) {
      case null:
        return;

      case false:
        return (
          <li><a href="/">Login Facebook</a></li>
        );

      default:
        return [
          <li key="1"><a href="/api/user/logout">Logout</a></li>
        ];
    }
  }

  render() {
    return (
      <nav>
        <div className="nav-wrapper">
          <Link
            to={this.props.auth ? '/surveys' : '/'}
            className="left brand-logo">
            World Domination Bot
          </Link>
          <ul id="nav-mobile" className="right">
            {this.renderContent()}
          </ul>
        </div>
      </nav>
    );
  }
}

export default Header;