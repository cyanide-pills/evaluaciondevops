FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=despacho_db
ENV MYSQL_USER=despacho_user
ENV MYSQL_PASSWORD=despacho_pass

EXPOSE 3306

COPY init.sql /docker-entrypoint-initdb.d/

CMD ["mysqld"]
