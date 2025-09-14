import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, TransactionRequest } from '../models/client.model';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // GET /clientes - LISTAR TODOS OS CLIENTES
  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.API_URL}/clientes`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // GET /clientes/:id - RETORNAR DETALHES DE UM CLIENTE
  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/clientes/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // POST /clientes - CADASTRAR NOVO CLIENTE
  createClient(client: Omit<Client, 'id'>): Observable<Client> {
    return this.http.post<Client>(`${this.API_URL}/clientes`, client, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // PUT /clientes/:id - EDITAR CLIENTE
  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.API_URL}/clientes/${id}`, client, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // DELETE /clientes/:id - EXCLUIR CLIENTE
  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/clientes/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // POST /clientes/:id/depositar - DEPOSITAR
  deposit(clientId: number, request: TransactionRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/clientes/${clientId}/depositar`, request, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // POST /clientes/:id/sacar - SACAR
  withdraw(clientId: number, request: TransactionRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/clientes/${clientId}/sacar`, request, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
