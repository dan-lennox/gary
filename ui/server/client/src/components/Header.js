import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Header extends Component {
  renderContent() {
    console.log('status', this.props.auth);
    switch(this.props.auth) {
      case null:
        return;

      case false:
        return (
          <li><a href="/api/ui/auth/facebook">Login with Facebook</a></li>
        );

      default:
        return (
          <li key="1"><a href="/api/ui/user/logout">Logout</a></li>
        );
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

function mapStateToProps({ auth }) {
  return { auth };
}

export default connect(mapStateToProps)(Header);