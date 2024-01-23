import Pedido from "../domain/entity/pedido";
import ClienteRepository from "./ClienteRepository";
import IPedido from "../interfaces/IPedido";
import Produto from '../domain/entity/produto';
import { IDataBase } from "../interfaces/IDataBase";
import produtoRoutes from '../application/api/routes/produtoRoutes';

class PedidoRepository implements IPedido{
   
    public db: IDataBase;
    private nomeTabela = "pedidos";
    
    constructor(database: IDataBase) {
        this.db = database;
      }

    public getAll = async (params: any) => {
        let CONDITIONS = "";
        let data;
        if (typeof params.status != 'undefined' && params.status != "") {

           //console.log(params.status);
            data = await this.db.find(
                this.nomeTabela,
                null,
                [{ campo: "status", valor: 4, condition:"!=", order: "status desc, created desc"},{
                    campo: "status",valor: parseInt(params.status)}]);

                    return data;
        }
        else{
            data = await this.db.find(
                this.nomeTabela,
                null,
                [{ campo: "status", valor: 4, condition:"!=", order: "status desc, created desc"}]);
                
                return data;
     
        }

    }

    public store = async(pedido: Pedido) => {
        console.log(pedido.cliente.id, pedido.getStatus(), pedido.getValorTotal());
        
        let data = await this.db.store(
            `INSERT INTO pedidos
                (customer_id, status, total_value, created, modified)
             VALUES
                (
                    ?,
                    ?,
                    ?,
                    NOW(),
                    NOW()
                );
            `, [pedido.cliente.id, pedido.getStatus(), pedido.getValorTotal()]);
            console.log(data);
        return new Pedido(
            pedido.cliente,
            pedido.getStatus(),
            parseInt(data.insertId)
        );
    }

    public adicionarProdutoAoPedido = async (pedidoId: Pedido, produtoId: Produto) => {
        let data = await this.db.store( `
            INSERT INTO pedido_produtos (order_id, product_id, created, modified)
            VALUES (?, ?, NOW(), NOW());
        `,[pedidoId, produtoId]);

        return data.insertId;
    }

    public update = async (pedido: Pedido, id: BigInteger) => {
        await this.db.store(
            `UPDATE pedidos SET
                customer_id = ?,
                status = ?,
                total_value = ?,
                modified = NOW()
            WHERE id = ?;
            `, [pedido.cliente.id, pedido.getStatus(), pedido.getValorTotal(), id]);
        return new Pedido(
            pedido.cliente,
            pedido.getStatus(),
            id
        );
    }

    public delete = async (id: BigInteger) => {
        return await this.db.delete(
            this.nomeTabela,
            [{ campo: "id", valor: id }]);
    }

    public findById = async (id: BigInteger) : Promise<Pedido> => {
        let dataPedido  = await this.db.find(this.nomeTabela, null ,[{ campo: "id", valor: id,}]);
        let dataProduto  = await this.db.getProdutosDoPedido(id)
        if (dataPedido != null){
            let cliente  = await new ClienteRepository(this.db).findById(dataPedido[0].customer_id) 
            
            let pedido = new Pedido(
                cliente,
                dataPedido[0].status,
                dataPedido[0].id,
                dataPedido[0].valorTotal
            );
            dataProduto.forEach(produto => {
                 pedido.adicionarProduto(produto)   
             });  
             return pedido;
        } else {
            return null;
        }
    }
}

export default PedidoRepository;
