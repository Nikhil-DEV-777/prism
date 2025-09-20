"""
Email utilities for sending OTP and other notifications.
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def send_email(recipient_email: str, subject: str, html_content: str) -> bool:
    """
    Send an email using SMTP settings from environment variables.
    
    Args:
        recipient_email: Email address of the recipient
        subject: Email subject
        html_content: HTML content of the email
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Get SMTP settings from environment variables
        smtp_host = settings.SMTP_HOST
        smtp_port = settings.SMTP_PORT
        smtp_user = settings.SMTP_USER
        smtp_pass = settings.SMTP_PASS
        sender_email = settings.SMTP_SENDER or smtp_user
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = sender_email
        message["To"] = recipient_email
        
        # Add HTML content
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Connect to SMTP server and send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(sender_email, recipient_email, message.as_string())
            
        logger.info(f"Email sent successfully to {recipient_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

def send_otp_email(recipient_email: str, recipient_name: str, otp_code: str) -> bool:
    """
    Send OTP verification email.
    
    Args:
        recipient_email: Email address of the recipient
        recipient_name: Name of the recipient
        otp_code: The OTP code to be sent
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    subject = "Your Samsung PRISM Verification Code"
    
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #1428a0; color: white; padding: 10px; text-align: center; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            .otp-code {{ font-size: 24px; font-weight: bold; text-align: center; 
                         padding: 10px; background-color: #eaeaea; margin: 20px 0; }}
            .footer {{ font-size: 12px; color: #666; text-align: center; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Samsung PRISM Verification</h2>
            </div>
            <div class="content">
                <p>Hello {recipient_name},</p>
                <p>Thank you for registering with Samsung PRISM Worklet Management System. To complete your registration, please use the following verification code:</p>
                
                <div class="otp-code">{otp_code}</div>
                
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this code, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>&copy; {datetime.now().year} Samsung PRISM. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(recipient_email, subject, html_content)

def send_password_reset_email(recipient_email: str, recipient_name: str, otp_code: str) -> bool:
    """
    Send password reset email with OTP.
    
    Args:
        recipient_email: Email address of the recipient
        recipient_name: Name of the recipient
        otp_code: The OTP code to be sent
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    subject = "Samsung PRISM Password Reset"
    
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #1428a0; color: white; padding: 10px; text-align: center; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            .otp-code {{ font-size: 24px; font-weight: bold; text-align: center; 
                         padding: 10px; background-color: #eaeaea; margin: 20px 0; }}
            .footer {{ font-size: 12px; color: #666; text-align: center; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Samsung PRISM Password Reset</h2>
            </div>
            <div class="content">
                <p>Hello {recipient_name},</p>
                <p>We received a request to reset your password for the Samsung PRISM Worklet Management System. To reset your password, please use the following verification code:</p>
                
                <div class="otp-code">{otp_code}</div>
                
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this password reset, please ignore this email or contact support.</p>
            </div>
            <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>&copy; {datetime.now().year} Samsung PRISM. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(recipient_email, subject, html_content)