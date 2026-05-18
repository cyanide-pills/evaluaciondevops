# SETUP AWS

## VPC
Crear una VPC con una subred publica y dos privadas. 
Tiene que tener una NAT Gateway.


## EC2
Crear tres instancias. Toda instancia debe llevar LabRole para acceder por SSM.

### ec2-front
En la subred pública.
Creen un grupo de seguridad que admita SSH 0.0.0.0/0
HTTP 0.0.0.0/0
ICMP 0.0.0.0/0

### ec2-back
En la subred privada 1.
Creen un grupo de seguridad que admita TCP personalizado 8080, y otro que admita TCP personalizado 8081.
También ICMP, SSH y HTTP. TODOS tienen que tener al grupo de seguridad de frontend como origen.

### ec2-db
En la subred privada 2.
Creen un grupo de seguridad que admita ICMP, SSH, y MYSQL con el grupo de seguridad de backend como origen.

Finalmente, instalen Docker y Docker compose en todas las instancias.


## ECR
Crear tres repositorios: backend_despachos, front_despachos, db.
Deben presionar el botón que aparece al final de la creación del repo (no recuerdo qué dice xd).
El resto de opciones dejenlas igual.

## Github
Clonen el repositorio localmente. Reemplacen la IP indicada en nginx.conf en el Frontend y también en env.backend.
Ingresen los secretos en el Area de secretos de repositorio. Los secretos relacionados con MYSQL están en env.example.


## Datos
Ingresen a la consola SSM de la base de datos y escriban:
"sudo docker exec -it db mysql -u root -proot despacho_db"
al entrar a mysql, ingresen:
"INSERT INTO despacho (id_despacho, despachado, direccion_compra, fecha_despacho, id_compra, intento, patente_camion, valor_compra) VALUES 
(10, b'1', 'TEST, Providencia', '2026-05-17', 4001, 0, 'AA-BB-11', 25000);"
o cualquier dato que quieran siguiendo este formato.
Al consultar, debería aparecer en las consultas de despacho.





