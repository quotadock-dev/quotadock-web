FROM nginx:1.28-alpine
COPY index.html style.css demo.js favicon.svg /usr/share/nginx/html/
COPY icons /usr/share/nginx/html/icons
COPY THIRD_PARTY_NOTICES.md /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
USER nginx
EXPOSE 8080
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
