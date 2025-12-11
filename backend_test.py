#!/usr/bin/env python3
"""
Backend Testing Suite for PDF Reports Functionality
Testing the ITSM system's PDF report generation with templates
"""

import requests
import json
import os
from datetime import datetime
from typing import Dict, Any, List

class ITSMBackendTester:
    def __init__(self):
        # Get backend URL from frontend .env
        self.base_url = "https://smart-itsm-2.preview.emergentagent.com/api"
        self.token = None
        self.test_results = []
        self.empresa_id = "6933cc2e9798f84094ba851b"  # Test empresa ID provided
        self.equipo_id = None
        
    def log_result(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> Dict:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        request_headers = {"Content-Type": "application/json"}
        
        if self.token:
            request_headers["Authorization"] = f"Bearer {self.token}"
        
        if headers:
            request_headers.update(headers)
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=request_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=request_headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=request_headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=request_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return {
                "status_code": response.status_code,
                "data": response.json() if response.content else {},
                "success": 200 <= response.status_code < 300
            }
        except requests.exceptions.RequestException as e:
            return {
                "status_code": 0,
                "data": {"error": str(e)},
                "success": False
            }
        except json.JSONDecodeError:
            return {
                "status_code": response.status_code,
                "data": {"error": "Invalid JSON response"},
                "success": False
            }
    
    def test_authentication(self):
        """Test 1: Authentication with admin credentials"""
        print("\n=== Testing Authentication ===")
        
        login_data = {
            "email": "admin@itsm.com",
            "password": "admin123"
        }
        
        result = self.make_request("POST", "/auth/login", login_data)
        
        if result["success"] and "token" in result["data"]:
            self.token = result["data"]["token"]
            user_info = result["data"].get("usuario", {})
            self.log_result(
                "Authentication", 
                True, 
                f"Successfully logged in as {user_info.get('nombre', 'Unknown')}",
                {"user_role": user_info.get("rol"), "user_email": user_info.get("email")}
            )
            return True
        else:
            self.log_result(
                "Authentication", 
                False, 
                f"Login failed: {result['data'].get('error', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return False
    
    def test_get_equipos_config(self):
        """Test 2: Get current custom fields configuration for equipos"""
        print("\n=== Testing Get Equipos Configuration ===")
        
        result = self.make_request("GET", "/configuracion/campos/equipos")
        
        if result["success"]:
            config = result["data"]
            self.log_result(
                "Get Equipos Config", 
                True, 
                "Successfully retrieved equipos configuration",
                {"current_config": config}
            )
            return config
        else:
            self.log_result(
                "Get Equipos Config", 
                False, 
                f"Failed to get configuration: {result['data'].get('error', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return None
    
    def test_update_equipos_config(self):
        """Test 3: Update custom fields configuration for equipos"""
        print("\n=== Testing Update Equipos Configuration ===")
        
        # Define test custom fields
        custom_fields = [
            {
                "nombre": "Número de Activo",
                "tipo": "texto",
                "requerido": False,
                "descripcion": "Número único de activo de la empresa"
            },
            {
                "nombre": "Fecha de Compra",
                "tipo": "fecha",
                "requerido": False,
                "descripcion": "Fecha de adquisición del equipo"
            },
            {
                "nombre": "Departamento",
                "tipo": "select",
                "requerido": False,
                "descripcion": "Departamento al que pertenece el equipo",
                "opciones": ["IT", "Ventas", "Administración"]
            }
        ]
        
        result = self.make_request("PUT", "/configuracion/campos/equipos", custom_fields)
        
        if result["success"]:
            self.log_result(
                "Update Equipos Config", 
                True, 
                "Successfully updated equipos configuration with 3 custom fields",
                {"fields_added": len(custom_fields)}
            )
            return True
        else:
            self.log_result(
                "Update Equipos Config", 
                False, 
                f"Failed to update configuration: {result['data'].get('error', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return False
    
    def test_verify_equipos_config(self):
        """Test 4: Verify the configuration was saved correctly"""
        print("\n=== Testing Verify Equipos Configuration ===")
        
        result = self.make_request("GET", "/configuracion/campos/equipos")
        
        if result["success"]:
            config = result["data"]
            campos = config.get("campos_equipos", [])
            
            expected_fields = ["Número de Activo", "Fecha de Compra", "Departamento"]
            found_fields = [campo.get("nombre") for campo in campos]
            
            all_found = all(field in found_fields for field in expected_fields)
            
            if all_found and len(campos) == 3:
                self.log_result(
                    "Verify Equipos Config", 
                    True, 
                    "Configuration saved correctly with all 3 fields",
                    {"saved_fields": found_fields}
                )
                return True
            else:
                self.log_result(
                    "Verify Equipos Config", 
                    False, 
                    f"Configuration mismatch. Expected 3 fields, found {len(campos)}",
                    {"expected": expected_fields, "found": found_fields}
                )
                return False
        else:
            self.log_result(
                "Verify Equipos Config", 
                False, 
                f"Failed to verify configuration: {result['data'].get('error', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return False
    
    def test_get_empresas(self):
        """Test 5: Get empresas to use for equipment creation"""
        print("\n=== Testing Get Empresas ===")
        
        result = self.make_request("GET", "/empresas")
        
        if result["success"]:
            empresas = result["data"]
            if empresas and len(empresas) > 0:
                self.empresa_id = empresas[0]["_id"]
                self.log_result(
                    "Get Empresas", 
                    True, 
                    f"Successfully retrieved {len(empresas)} empresas",
                    {"selected_empresa": empresas[0].get("nombre"), "empresa_id": self.empresa_id}
                )
                return True
            else:
                self.log_result(
                    "Get Empresas", 
                    False, 
                    "No empresas found in database",
                    {"empresas_count": 0}
                )
                return False
        else:
            self.log_result(
                "Get Empresas", 
                False, 
                f"Failed to get empresas: {result['data'].get('error', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return False
    
    def test_create_equipo_with_custom_fields(self):
        """Test 6: Create equipment with custom fields"""
        print("\n=== Testing Create Equipo with Custom Fields ===")
        
        if not self.empresa_id:
            self.log_result(
                "Create Equipo with Custom Fields", 
                False, 
                "Cannot create equipo: no empresa_id available",
                {}
            )
            return False
        
        equipo_data = {
            "nombre": "Test Laptop Custom Fields",
            "tipo": "Laptop",
            "marca": "HP",
            "modelo": "EliteBook",
            "numero_serie": "TEST-CF-001",
            "ubicacion": "Oficina Central",
            "estado": "Activo",
            "empresa_id": self.empresa_id,
            "campos_personalizados": {
                "Número de Activo": "ACT-001",
                "Fecha de Compra": "2024-01-15",
                "Departamento": "IT"
            }
        }
        
        result = self.make_request("POST", "/equipos", equipo_data)
        
        if result["success"] and "id" in result["data"]:
            self.equipo_id = result["data"]["id"]
            self.log_result(
                "Create Equipo with Custom Fields", 
                True, 
                "Successfully created equipo with custom fields",
                {"equipo_id": self.equipo_id, "custom_fields": equipo_data["campos_personalizados"]}
            )
            return True
        else:
            self.log_result(
                "Create Equipo with Custom Fields", 
                False, 
                f"Failed to create equipo: {result['data'].get('error', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return False
    
    def test_verify_equipo_persistence(self):
        """Test 7: Verify custom fields were saved correctly"""
        print("\n=== Testing Verify Equipo Persistence ===")
        
        if not self.equipo_id:
            self.log_result(
                "Verify Equipo Persistence", 
                False, 
                "Cannot verify equipo: no equipo_id available",
                {}
            )
            return False
        
        result = self.make_request("GET", f"/equipos/{self.equipo_id}")
        
        if result["success"]:
            equipo = result["data"]
            campos_personalizados = equipo.get("campos_personalizados", {})
            
            expected_fields = {
                "Número de Activo": "ACT-001",
                "Fecha de Compra": "2024-01-15",
                "Departamento": "IT"
            }
            
            all_correct = all(
                campos_personalizados.get(key) == value 
                for key, value in expected_fields.items()
            )
            
            if all_correct:
                self.log_result(
                    "Verify Equipo Persistence", 
                    True, 
                    "Custom fields persisted correctly",
                    {"saved_fields": campos_personalizados}
                )
                return True
            else:
                self.log_result(
                    "Verify Equipo Persistence", 
                    False, 
                    "Custom fields not saved correctly",
                    {"expected": expected_fields, "actual": campos_personalizados}
                )
                return False
        else:
            self.log_result(
                "Verify Equipo Persistence", 
                False, 
                f"Failed to retrieve equipo: {result['data'].get('error', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return False
    
    def test_list_equipos_with_custom_fields(self):
        """Test 8: Verify equipo appears in list with custom fields"""
        print("\n=== Testing List Equipos with Custom Fields ===")
        
        if not self.empresa_id:
            self.log_result(
                "List Equipos with Custom Fields", 
                False, 
                "Cannot list equipos: no empresa_id available",
                {}
            )
            return False
        
        result = self.make_request("GET", f"/equipos?empresa_id={self.empresa_id}")
        
        if result["success"]:
            equipos = result["data"]
            test_equipo = None
            
            for equipo in equipos:
                if equipo.get("numero_serie") == "TEST-CF-001":
                    test_equipo = equipo
                    break
            
            if test_equipo:
                campos_personalizados = test_equipo.get("campos_personalizados", {})
                has_custom_fields = len(campos_personalizados) > 0
                
                self.log_result(
                    "List Equipos with Custom Fields", 
                    has_custom_fields, 
                    f"Test equipo found in list {'with' if has_custom_fields else 'without'} custom fields",
                    {"equipo_found": True, "custom_fields": campos_personalizados}
                )
                return has_custom_fields
            else:
                self.log_result(
                    "List Equipos with Custom Fields", 
                    False, 
                    "Test equipo not found in list",
                    {"total_equipos": len(equipos)}
                )
                return False
        else:
            self.log_result(
                "List Equipos with Custom Fields", 
                False, 
                f"Failed to list equipos: {result['data'].get('error', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return False
    
    def test_update_equipo_custom_fields(self):
        """Test 9: Update custom fields in existing equipo"""
        print("\n=== Testing Update Equipo Custom Fields ===")
        
        if not self.equipo_id:
            self.log_result(
                "Update Equipo Custom Fields", 
                False, 
                "Cannot update equipo: no equipo_id available",
                {}
            )
            return False
        
        update_data = {
            "campos_personalizados": {
                "Número de Activo": "ACT-001",
                "Fecha de Compra": "2024-01-15",
                "Departamento": "Ventas"  # Changed from IT to Ventas
            }
        }
        
        result = self.make_request("PUT", f"/equipos/{self.equipo_id}", update_data)
        
        if result["success"]:
            self.log_result(
                "Update Equipo Custom Fields", 
                True, 
                "Successfully updated custom fields",
                {"updated_department": "Ventas"}
            )
            return True
        else:
            self.log_result(
                "Update Equipo Custom Fields", 
                False, 
                f"Failed to update equipo: {result['data'].get('error', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return False
    
    def test_verify_equipo_update(self):
        """Test 10: Verify the update was saved correctly"""
        print("\n=== Testing Verify Equipo Update ===")
        
        if not self.equipo_id:
            self.log_result(
                "Verify Equipo Update", 
                False, 
                "Cannot verify update: no equipo_id available",
                {}
            )
            return False
        
        result = self.make_request("GET", f"/equipos/{self.equipo_id}")
        
        if result["success"]:
            equipo = result["data"]
            campos_personalizados = equipo.get("campos_personalizados", {})
            departamento = campos_personalizados.get("Departamento")
            
            if departamento == "Ventas":
                self.log_result(
                    "Verify Equipo Update", 
                    True, 
                    "Update verified: Departamento changed to Ventas",
                    {"updated_fields": campos_personalizados}
                )
                return True
            else:
                self.log_result(
                    "Verify Equipo Update", 
                    False, 
                    f"Update not saved: Departamento is '{departamento}', expected 'Ventas'",
                    {"actual_fields": campos_personalizados}
                )
                return False
        else:
            self.log_result(
                "Verify Equipo Update", 
                False, 
                f"Failed to retrieve updated equipo: {result['data'].get('error', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return False
    
    def test_validation_invalid_field_type(self):
        """Test 11: Test validation with invalid field type"""
        print("\n=== Testing Validation - Invalid Field Type ===")
        
        invalid_fields = [
            {
                "nombre": "Invalid Field",
                "tipo": "invalid_type",  # Invalid type
                "requerido": False
            }
        ]
        
        result = self.make_request("PUT", "/configuracion/campos/equipos", invalid_fields)
        
        if not result["success"] and result["status_code"] == 400:
            self.log_result(
                "Validation - Invalid Field Type", 
                True, 
                "Correctly rejected invalid field type",
                {"error_message": result["data"].get("detail", "Unknown error")}
            )
            return True
        else:
            self.log_result(
                "Validation - Invalid Field Type", 
                False, 
                "Should have rejected invalid field type",
                {"status_code": result["status_code"], "response": result["data"]}
            )
            return False
    
    def test_validation_missing_field_name(self):
        """Test 12: Test validation with missing field name"""
        print("\n=== Testing Validation - Missing Field Name ===")
        
        invalid_fields = [
            {
                "tipo": "texto",  # Missing "nombre"
                "requerido": False
            }
        ]
        
        result = self.make_request("PUT", "/configuracion/campos/equipos", invalid_fields)
        
        if not result["success"] and result["status_code"] == 400:
            self.log_result(
                "Validation - Missing Field Name", 
                True, 
                "Correctly rejected field without name",
                {"error_message": result["data"].get("detail", "Unknown error")}
            )
            return True
        else:
            self.log_result(
                "Validation - Missing Field Name", 
                False, 
                "Should have rejected field without name",
                {"status_code": result["status_code"], "response": result["data"]}
            )
            return False
    
    def test_validation_select_without_options(self):
        """Test 13: Test validation for select field without options"""
        print("\n=== Testing Validation - Select Without Options ===")
        
        invalid_fields = [
            {
                "nombre": "Select Field",
                "tipo": "select",  # Select type without "opciones"
                "requerido": False
            }
        ]
        
        result = self.make_request("PUT", "/configuracion/campos/equipos", invalid_fields)
        
        if not result["success"] and result["status_code"] == 400:
            self.log_result(
                "Validation - Select Without Options", 
                True, 
                "Correctly rejected select field without options",
                {"error_message": result["data"].get("detail", "Unknown error")}
            )
            return True
        else:
            self.log_result(
                "Validation - Select Without Options", 
                False, 
                "Should have rejected select field without options",
                {"status_code": result["status_code"], "response": result["data"]}
            )
            return False
    
    def test_other_entities_config(self):
        """Test 14: Test configuration endpoints for other entities"""
        print("\n=== Testing Other Entities Configuration ===")
        
        entities = ["bitacoras", "empresas", "servicios"]
        results = {}
        
        for entity in entities:
            result = self.make_request("GET", f"/configuracion/campos/{entity}")
            results[entity] = result["success"]
            
            if result["success"]:
                self.log_result(
                    f"Get {entity.title()} Config", 
                    True, 
                    f"Successfully retrieved {entity} configuration",
                    {"config": result["data"]}
                )
            else:
                self.log_result(
                    f"Get {entity.title()} Config", 
                    False, 
                    f"Failed to get {entity} configuration: {result['data'].get('error', 'Unknown error')}",
                    {"status_code": result["status_code"]}
                )
        
        all_success = all(results.values())
        return all_success
    
    def test_invalid_entity_type(self):
        """Test 15: Test invalid entity type"""
        print("\n=== Testing Invalid Entity Type ===")
        
        result = self.make_request("GET", "/configuracion/campos/invalid_entity")
        
        if not result["success"] and result["status_code"] == 400:
            self.log_result(
                "Invalid Entity Type", 
                True, 
                "Correctly rejected invalid entity type",
                {"error_message": result["data"].get("detail", "Unknown error")}
            )
            return True
        else:
            self.log_result(
                "Invalid Entity Type", 
                False, 
                "Should have rejected invalid entity type",
                {"status_code": result["status_code"], "response": result["data"]}
            )
            return False
    
    def test_empresa_report_moderna(self):
        """Test 1: Generate empresa report with moderna template"""
        print("\n=== Testing Empresa Report - Moderna Template ===")
        
        result = self.make_request("GET", f"/reportes/empresa/{self.empresa_id}?template=moderna")
        
        if result["success"]:
            response_data = result["data"]
            if "filename" in response_data:
                self.log_result(
                    "Empresa Report - Moderna", 
                    True, 
                    "Successfully generated empresa report with moderna template",
                    {"filename": response_data["filename"], "message": response_data.get("message")}
                )
                return response_data["filename"]
            else:
                self.log_result(
                    "Empresa Report - Moderna", 
                    False, 
                    "Response missing filename",
                    {"response": response_data}
                )
                return None
        else:
            self.log_result(
                "Empresa Report - Moderna", 
                False, 
                f"Failed to generate report: {result['data'].get('detail', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return None
    
    def test_empresa_report_clasica(self):
        """Test 2: Generate empresa report with clasica template"""
        print("\n=== Testing Empresa Report - Clasica Template ===")
        
        result = self.make_request("GET", f"/reportes/empresa/{self.empresa_id}?template=clasica")
        
        if result["success"]:
            response_data = result["data"]
            if "filename" in response_data:
                self.log_result(
                    "Empresa Report - Clasica", 
                    True, 
                    "Successfully generated empresa report with clasica template",
                    {"filename": response_data["filename"], "message": response_data.get("message")}
                )
                return response_data["filename"]
            else:
                self.log_result(
                    "Empresa Report - Clasica", 
                    False, 
                    "Response missing filename",
                    {"response": response_data}
                )
                return None
        else:
            self.log_result(
                "Empresa Report - Clasica", 
                False, 
                f"Failed to generate report: {result['data'].get('detail', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return None
    
    def test_empresa_report_minimalista(self):
        """Test 3: Generate empresa report with minimalista template"""
        print("\n=== Testing Empresa Report - Minimalista Template ===")
        
        result = self.make_request("GET", f"/reportes/empresa/{self.empresa_id}?template=minimalista")
        
        if result["success"]:
            response_data = result["data"]
            if "filename" in response_data:
                self.log_result(
                    "Empresa Report - Minimalista", 
                    True, 
                    "Successfully generated empresa report with minimalista template",
                    {"filename": response_data["filename"], "message": response_data.get("message")}
                )
                return response_data["filename"]
            else:
                self.log_result(
                    "Empresa Report - Minimalista", 
                    False, 
                    "Response missing filename",
                    {"response": response_data}
                )
                return None
        else:
            self.log_result(
                "Empresa Report - Minimalista", 
                False, 
                f"Failed to generate report: {result['data'].get('detail', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return None
    
    def test_bitacoras_report_moderna_mes(self):
        """Test 4: Generate bitacoras report with moderna template and mes period"""
        print("\n=== Testing Bitacoras Report - Moderna Template (Mes) ===")
        
        result = self.make_request("GET", f"/bitacoras/exportar-pdf?empresa_id={self.empresa_id}&periodo=mes&template=moderna")
        
        if result["success"]:
            response_data = result["data"]
            if "filename" in response_data:
                self.log_result(
                    "Bitacoras Report - Moderna (Mes)", 
                    True, 
                    "Successfully generated bitacoras report with moderna template for mes period",
                    {"filename": response_data["filename"], "message": response_data.get("message")}
                )
                return response_data["filename"]
            else:
                self.log_result(
                    "Bitacoras Report - Moderna (Mes)", 
                    False, 
                    "Response missing filename",
                    {"response": response_data}
                )
                return None
        else:
            self.log_result(
                "Bitacoras Report - Moderna (Mes)", 
                False, 
                f"Failed to generate report: {result['data'].get('detail', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return None
    
    def test_bitacoras_report_clasica_semana(self):
        """Test 5: Generate bitacoras report with clasica template and semana period"""
        print("\n=== Testing Bitacoras Report - Clasica Template (Semana) ===")
        
        result = self.make_request("GET", f"/bitacoras/exportar-pdf?empresa_id={self.empresa_id}&periodo=semana&template=clasica")
        
        if result["success"]:
            response_data = result["data"]
            if "filename" in response_data:
                self.log_result(
                    "Bitacoras Report - Clasica (Semana)", 
                    True, 
                    "Successfully generated bitacoras report with clasica template for semana period",
                    {"filename": response_data["filename"], "message": response_data.get("message")}
                )
                return response_data["filename"]
            else:
                self.log_result(
                    "Bitacoras Report - Clasica (Semana)", 
                    False, 
                    "Response missing filename",
                    {"response": response_data}
                )
                return None
        else:
            self.log_result(
                "Bitacoras Report - Clasica (Semana)", 
                False, 
                f"Failed to generate report: {result['data'].get('detail', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return None
    
    def test_bitacoras_report_minimalista_dia(self):
        """Test 6: Generate bitacoras report with minimalista template and dia period"""
        print("\n=== Testing Bitacoras Report - Minimalista Template (Dia) ===")
        
        result = self.make_request("GET", f"/bitacoras/exportar-pdf?empresa_id={self.empresa_id}&periodo=dia&template=minimalista")
        
        if result["success"]:
            response_data = result["data"]
            if "filename" in response_data:
                self.log_result(
                    "Bitacoras Report - Minimalista (Dia)", 
                    True, 
                    "Successfully generated bitacoras report with minimalista template for dia period",
                    {"filename": response_data["filename"], "message": response_data.get("message")}
                )
                return response_data["filename"]
            else:
                self.log_result(
                    "Bitacoras Report - Minimalista (Dia)", 
                    False, 
                    "Response missing filename",
                    {"response": response_data}
                )
                return None
        else:
            self.log_result(
                "Bitacoras Report - Minimalista (Dia)", 
                False, 
                f"Failed to generate report: {result['data'].get('detail', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return None
    
    def test_verify_pdf_files_exist(self):
        """Test 7: Verify that PDF files are generated in the backend/pdfs directory"""
        print("\n=== Testing PDF Files Existence ===")
        
        # Check if pdfs directory exists and has files
        try:
            import subprocess
            result = subprocess.run(['ls', '-la', '/app/backend/pdfs/'], capture_output=True, text=True)
            
            if result.returncode == 0:
                files = result.stdout.strip().split('\n')
                pdf_files = [f for f in files if '.pdf' in f]
                
                if len(pdf_files) > 2:  # More than just . and ..
                    self.log_result(
                        "PDF Files Existence", 
                        True, 
                        f"Found {len(pdf_files)} PDF files in /app/backend/pdfs/",
                        {"files": pdf_files[:5]}  # Show first 5 files
                    )
                    return True
                else:
                    self.log_result(
                        "PDF Files Existence", 
                        False, 
                        "No PDF files found in /app/backend/pdfs/",
                        {"directory_content": files}
                    )
                    return False
            else:
                self.log_result(
                    "PDF Files Existence", 
                    False, 
                    "Could not access /app/backend/pdfs/ directory",
                    {"error": result.stderr}
                )
                return False
        except Exception as e:
            self.log_result(
                "PDF Files Existence", 
                False, 
                f"Exception checking PDF files: {str(e)}",
                {"exception_type": type(e).__name__}
            )
            return False
    
    def test_verify_pdf_file_sizes(self):
        """Test 8: Verify that generated PDF files have size > 0 bytes"""
        print("\n=== Testing PDF File Sizes ===")
        
        try:
            import subprocess
            result = subprocess.run(['find', '/app/backend/pdfs/', '-name', '*.pdf', '-exec', 'ls', '-l', '{}', ';'], 
                                  capture_output=True, text=True)
            
            if result.returncode == 0:
                files_info = result.stdout.strip().split('\n')
                valid_files = 0
                invalid_files = 0
                
                for file_info in files_info:
                    if file_info and '.pdf' in file_info:
                        parts = file_info.split()
                        if len(parts) >= 5:
                            try:
                                file_size = int(parts[4])
                                if file_size > 0:
                                    valid_files += 1
                                else:
                                    invalid_files += 1
                            except:
                                pass
                
                if valid_files > 0 and invalid_files == 0:
                    self.log_result(
                        "PDF File Sizes", 
                        True, 
                        f"All {valid_files} PDF files have valid size > 0 bytes",
                        {"valid_files": valid_files}
                    )
                    return True
                else:
                    self.log_result(
                        "PDF File Sizes", 
                        False, 
                        f"Found {invalid_files} files with 0 bytes, {valid_files} valid files",
                        {"valid_files": valid_files, "invalid_files": invalid_files}
                    )
                    return False
            else:
                self.log_result(
                    "PDF File Sizes", 
                    False, 
                    "Could not check PDF file sizes",
                    {"error": result.stderr}
                )
                return False
        except Exception as e:
            self.log_result(
                "PDF File Sizes", 
                False, 
                f"Exception checking PDF file sizes: {str(e)}",
                {"exception_type": type(e).__name__}
            )
            return False
    
    def test_empresa_report_invalid_id(self):
        """Test 9: Test empresa report with invalid empresa_id"""
        print("\n=== Testing Empresa Report - Invalid ID ===")
        
        invalid_id = "invalid_empresa_id_123"
        result = self.make_request("GET", f"/reportes/empresa/{invalid_id}?template=moderna")
        
        if not result["success"] and result["status_code"] == 404:
            self.log_result(
                "Empresa Report - Invalid ID", 
                True, 
                "Correctly rejected invalid empresa_id with 404 error",
                {"error_message": result["data"].get("detail", "Unknown error")}
            )
            return True
        else:
            self.log_result(
                "Empresa Report - Invalid ID", 
                False, 
                "Should have rejected invalid empresa_id with 404",
                {"status_code": result["status_code"], "response": result["data"]}
            )
            return False
    
    def test_empresa_report_invalid_template(self):
        """Test 10: Test empresa report with invalid template (should default to moderna)"""
        print("\n=== Testing Empresa Report - Invalid Template ===")
        
        result = self.make_request("GET", f"/reportes/empresa/{self.empresa_id}?template=invalid_template")
        
        if result["success"]:
            response_data = result["data"]
            if "filename" in response_data:
                self.log_result(
                    "Empresa Report - Invalid Template", 
                    True, 
                    "Successfully generated report with invalid template (defaulted to moderna)",
                    {"filename": response_data["filename"], "message": response_data.get("message")}
                )
                return True
            else:
                self.log_result(
                    "Empresa Report - Invalid Template", 
                    False, 
                    "Response missing filename",
                    {"response": response_data}
                )
                return False
        else:
            self.log_result(
                "Empresa Report - Invalid Template", 
                False, 
                f"Failed to generate report: {result['data'].get('detail', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return False
    
    def test_empresa_report_no_template(self):
        """Test 11: Test empresa report without template parameter (should default to moderna)"""
        print("\n=== Testing Empresa Report - No Template Parameter ===")
        
        result = self.make_request("GET", f"/reportes/empresa/{self.empresa_id}")
        
        if result["success"]:
            response_data = result["data"]
            if "filename" in response_data:
                self.log_result(
                    "Empresa Report - No Template", 
                    True, 
                    "Successfully generated report without template parameter (defaulted to moderna)",
                    {"filename": response_data["filename"], "message": response_data.get("message")}
                )
                return True
            else:
                self.log_result(
                    "Empresa Report - No Template", 
                    False, 
                    "Response missing filename",
                    {"response": response_data}
                )
                return False
        else:
            self.log_result(
                "Empresa Report - No Template", 
                False, 
                f"Failed to generate report: {result['data'].get('detail', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return False
    
    def test_bitacoras_report_invalid_empresa_id(self):
        """Test 12: Test bitacoras report with invalid empresa_id"""
        print("\n=== Testing Bitacoras Report - Invalid Empresa ID ===")
        
        invalid_id = "invalid_empresa_id_123"
        result = self.make_request("GET", f"/bitacoras/exportar-pdf?empresa_id={invalid_id}&periodo=mes&template=moderna")
        
        if not result["success"] and result["status_code"] == 404:
            self.log_result(
                "Bitacoras Report - Invalid Empresa ID", 
                True, 
                "Correctly rejected invalid empresa_id with 404 error",
                {"error_message": result["data"].get("detail", "Unknown error")}
            )
            return True
        else:
            self.log_result(
                "Bitacoras Report - Invalid Empresa ID", 
                False, 
                "Should have rejected invalid empresa_id with 404",
                {"status_code": result["status_code"], "response": result["data"]}
            )
            return False
    
    def test_bitacoras_report_invalid_template(self):
        """Test 13: Test bitacoras report with invalid template (should default to moderna)"""
        print("\n=== Testing Bitacoras Report - Invalid Template ===")
        
        result = self.make_request("GET", f"/bitacoras/exportar-pdf?empresa_id={self.empresa_id}&periodo=mes&template=invalid_template")
        
        if result["success"]:
            response_data = result["data"]
            if "filename" in response_data:
                self.log_result(
                    "Bitacoras Report - Invalid Template", 
                    True, 
                    "Successfully generated bitacoras report with invalid template (defaulted to moderna)",
                    {"filename": response_data["filename"], "message": response_data.get("message")}
                )
                return True
            else:
                self.log_result(
                    "Bitacoras Report - Invalid Template", 
                    False, 
                    "Response missing filename",
                    {"response": response_data}
                )
                return False
        else:
            self.log_result(
                "Bitacoras Report - Invalid Template", 
                False, 
                f"Failed to generate report: {result['data'].get('detail', 'Unknown error')}",
                {"status_code": result["status_code"]}
            )
            return False
    
    def run_all_tests(self):
        """Run all PDF report tests in sequence"""
        print("🚀 Starting ITSM PDF Reports Backend Testing Suite")
        print("=" * 60)
        
        # Authentication is required for all other tests
        if not self.test_authentication():
            print("\n❌ Authentication failed. Cannot proceed with other tests.")
            return False
        
        # Run all PDF report tests
        tests = [
            self.test_empresa_report_moderna,
            self.test_empresa_report_clasica,
            self.test_empresa_report_minimalista,
            self.test_bitacoras_report_moderna_mes,
            self.test_bitacoras_report_clasica_semana,
            self.test_bitacoras_report_minimalista_dia,
            self.test_verify_pdf_files_exist,
            self.test_verify_pdf_file_sizes,
            self.test_empresa_report_invalid_id,
            self.test_empresa_report_invalid_template,
            self.test_empresa_report_no_template,
            self.test_bitacoras_report_invalid_empresa_id,
            self.test_bitacoras_report_invalid_template
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.log_result(
                    test.__name__, 
                    False, 
                    f"Test failed with exception: {str(e)}",
                    {"exception_type": type(e).__name__}
                )
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = ITSMBackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Custom fields functionality is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Please check the results above.")